import type { ProvisionerConfig } from "../config.js";
import type { NodeStatus, ProxmoxAdapter, ProvisionedVm, ProvisionInput } from "./types.js";

interface PveNodeInfo {
  node: string;
  status?: string;
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
}

interface PveQemuVm {
  vmid: number;
  name?: string;
  template?: number;
  status?: string;
  tags?: string;
}

interface PveTaskStatus {
  status?: "stopped" | "running";
  exitstatus?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Real Proxmox VE API client.
 * Auth: restricted API token (recommended) OR user@realm + password.
 */
export class ProxmoxClient implements ProxmoxAdapter {
  readonly mode = "real" as const;
  private readonly config: ProvisionerConfig;
  private cookie: string | null = null;
  private csrfToken: string | null = null;

  constructor(config: ProvisionerConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.PROXMOX_API_URL.replace(/\/$/, "");
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<{ data: unknown }> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = { accept: "application/json" };
    if (this.config.PROXMOX_AUTH_MODE === "token") {
      headers.authorization = `PVEAPIToken=${this.config.PROXMOX_USER}!${this.config.PROXMOX_TOKEN_ID}=${this.config.PROXMOX_TOKEN_SECRET}`;
    } else if (this.cookie) {
      headers.cookie = this.cookie;
      if (this.csrfToken && !["GET", "HEAD"].includes(method)) headers["csrfpreventiontoken"] = this.csrfToken;
    }
    if (body) headers["content-type"] = "application/x-www-form-urlencoded";
    const res = await fetch(url, {
      method,
      headers,
      body: body ? new URLSearchParams(this.stringify(body)) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    const json = (() => {
      try {
        return JSON.parse(text) as { data?: unknown; errors?: unknown };
      } catch {
        throw new Error(`PVE ${method} ${path} returned ${res.status}: ${text.slice(0, 200)}`);
      }
    })();
    if (!res.ok) throw new Error(`PVE ${method} ${path} failed (${res.status}): ${JSON.stringify(json.errors ?? json)}`);
    if (json.data === undefined) throw new Error(`PVE ${method} ${path} returned no data`);
    return { data: json.data };
  }

  private stringify(body: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null && v !== "") out[k] = String(v);
    }
    return out;
  }

  async authenticate(): Promise<void> {
    if (this.config.PROXMOX_AUTH_MODE === "token") return;
    if (this.cookie) return;
    const url = `${this.baseUrl}/access/ticket`;
    const res = await fetch(url, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: this.config.PROXMOX_USER,
        password: this.config.PROXMOX_PASSWORD,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`PVE authentication failed (${res.status})`);
    const json = (await res.json()) as { data?: { ticket?: string; CSRFPreventionToken?: string } };
    if (!json.data?.ticket) throw new Error("PVE authentication failed: no ticket");
    this.cookie = `PVEAuthCookie=${json.data.ticket}`;
    this.csrfToken = json.data.CSRFPreventionToken ?? null;
  }

  private async waitTask(node: string, upid: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const { data } = await this.request("GET", `/nodes/${node}/tasks/${encodeURIComponent(upid)}/status`);
      const task = data as PveTaskStatus;
      if (task.status === "stopped") {
        if (task.exitstatus && task.exitstatus !== "OK") {
          throw new Error(`PVE task ${upid} failed with exit status ${task.exitstatus}`);
        }
        return;
      }
      if (Date.now() > deadline) throw new Error(`PVE task ${upid} timed out`);
      await sleep(1000);
    }
  }

  async findVmByName(orderId: string): Promise<{ vmId: number; node: string } | null> {
    const { data } = await this.request("GET", "/cluster/resources", undefined, { type: "vm" });
    const vms = data as Array<{ vmid: number; node: string; name?: string; tags?: string }>;
    const hit = vms.find(
      (vm) => vm.tags?.split(/[;,]/).some((t) => t.trim() === `irctcrdp-order-${orderId}`) || vm.name === `rdp-${orderId.slice(0, 8)}`,
    );
    return hit ? { vmId: hit.vmid, node: hit.node } : null;
  }

  private async findTemplate(templateId: string): Promise<{ vmid: number; node: string } | null> {
    const { data } = await this.request("GET", `/nodes/${this.config.PROXMOX_NODE}/qemu`, undefined, { full: 1 });
    const vms = data as PveQemuVm[];
    const hit = vms.find(
      (vm) =>
        vm.template === 1 && (vm.name === templateId || String(vm.vmid) === templateId),
    );
    return hit ? { vmid: hit.vmid, node: this.config.PROXMOX_NODE } : null;
  }

  async ensureVm(input: ProvisionInput): Promise<ProvisionedVm> {
    await this.authenticate();
    const existing = await this.findVmByName(input.orderId);
    if (existing) return existing;

    const template = await this.findTemplate(input.templateId);
    if (!template) throw new Error(`Proxmox template "${input.templateId}" not found on node ${this.config.PROXMOX_NODE}`);

    const { data: nextId } = await this.request("GET", "/cluster/nextid");
    const newId = nextId as number;
    const tags = `irctcrdp,irctcrdp-order-${input.orderId}`;

    const params: Record<string, unknown> = {
      newid: newId,
      name: input.hostname,
      full: 1,
      tags,
    };
    if (this.config.PROXMOX_POOL) params.pool = this.config.PROXMOX_POOL;

    const cloneRes = await this.request("POST", `/nodes/${template.node}/qemu/${template.vmid}/clone`, params);
    await this.waitTask(template.node, (cloneRes.data as { upid: string }).upid, 180_000);

    const node = template.node;
    await this.request("PUT", `/nodes/${node}/qemu/${newId}/config`, {
      cores: input.cpuCores,
      memory: input.ramMB,
      sockets: 1,
      net0: `virtio,bridge=${this.config.PROXMOX_BRIDGE}`,
      ...(input.windows ? {} : { ipconfig0: `ip=${input.ipv4}/${input.prefixLen},gw=${input.gateway}` }),
      ...(input.windows ? {} : { nameserver: `${input.dnsPrimary} ${input.dnsSecondary}` }),
    });

    const { data: vmConfig } = await this.request("GET", `/nodes/${node}/qemu/${newId}/config`);
    const diskConfig = vmConfig as Record<string, string>;
    const diskKey = Object.keys(diskConfig).find((k) => /^scsi\d+$/.test(k) || /^virtio\d+$/.test(k) || /^ide\d+$/.test(k));
    if (diskKey && diskConfig[diskKey]) {
      const sizeMatch = /,size=(\d+)([GM])/.exec(diskConfig[diskKey]);
      if (sizeMatch) {
        const sizeGb = sizeMatch[2] === "G" ? Number(sizeMatch[1]) : Math.round(Number(sizeMatch[1]) / 1024);
        if (sizeGb < input.diskGB) {
          await this.request("PUT", `/nodes/${node}/qemu/${newId}/resize`, {
            disk: diskKey,
            size: `+${input.diskGB - sizeGb}G`,
          });
        }
      }
    }

    const startRes = await this.request("POST", `/nodes/${node}/qemu/${newId}/status/start`);
    await this.waitTask(node, (startRes.data as { upid: string }).upid, 120_000);

    return { vmId: newId, node };
  }

  async waitHealthy(orderId: string, timeoutMs: number): Promise<void> {
    await this.authenticate();
    const existing = await this.findVmByName(orderId);
    if (!existing) throw new Error(`VM for order ${orderId} not found during health check`);
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const { data } = await this.request("GET", `/nodes/${existing.node}/qemu/${existing.vmId}/status/current`);
      if ((data as { status?: string }).status === "running") return;
      if (Date.now() > deadline) throw new Error(`VM ${existing.vmId} did not become running in time`);
      await sleep(3000);
    }
  }

  private async vmTask(orderId: string, action: "stop" | "reboot", timeoutMs = 120_000): Promise<void> {
    await this.authenticate();
    const existing = await this.findVmByName(orderId);
    if (!existing) return; // already gone — idempotent
    const res = await this.request("POST", `/nodes/${existing.node}/qemu/${existing.vmId}/status/${action}`);
    await this.waitTask(existing.node, (res.data as { upid: string }).upid, timeoutMs);
  }

  async reboot(orderId: string): Promise<void> {
    await this.vmTask(orderId, "reboot");
  }

  async destroy(orderId: string): Promise<void> {
    await this.authenticate();
    const existing = await this.findVmByName(orderId);
    if (!existing) return;
    const { data: status } = await this.request("GET", `/nodes/${existing.node}/qemu/${existing.vmId}/status/current`);
    if ((status as { status?: string }).status === "running") {
      const stopRes = await this.request("POST", `/nodes/${existing.node}/qemu/${existing.vmId}/status/stop`);
      await this.waitTask(existing.node, (stopRes.data as { upid: string }).upid, 120_000);
    }
    const delRes = await this.request("DELETE", `/nodes/${existing.node}/qemu/${existing.vmId}`);
    await this.waitTask(existing.node, (delRes.data as { upid: string }).upid, 120_000);
  }

  async reinstall(orderId: string, input: ProvisionInput): Promise<ProvisionedVm> {
    await this.destroy(orderId);
    return this.ensureVm(input);
  }

  async collectNodes(): Promise<NodeStatus[]> {
    await this.authenticate();
    const { data } = await this.request("GET", "/nodes");
    const nodes = data as PveNodeInfo[];
    const out: NodeStatus[] = [];
    for (const node of nodes) {
      let status: NodeStatus["status"] = "unknown";
      if (node.status === "online") status = "online";
      else if (node.status === "offline") status = "offline";
      out.push({
        nodeName: node.node,
        status,
        cpuCores: node.maxcpu ? Math.round(node.maxcpu) : null,
        memoryTotalMb: node.maxmem ? Math.round(node.maxmem / 1024 / 1024) : null,
        memoryUsedMb: node.mem ? Math.round(node.mem / 1024 / 1024) : null,
        diskTotalGb: node.maxdisk ? Math.round(node.maxdisk / 1024 / 1024 / 1024) : null,
        diskUsedGb: node.disk ? Math.round(node.disk / 1024 / 1024 / 1024) : null,
      });
    }
    return out;
  }
}