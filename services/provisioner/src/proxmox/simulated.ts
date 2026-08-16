import type { NodeStatus, ProxmoxAdapter, ProvisionedVm, ProvisionInput } from "./types.js";

interface SimVm {
  vmId: number;
  node: string;
  orderId: string;
  hostname: string;
  running: boolean;
  createdAt: Date;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Deterministic in-memory simulation of the Proxmox API so the full
 * payment -> job -> provision -> health-check -> ACTIVE pipeline runs
 * end-to-end without a real cluster. Switch to the real client via
 * PROXMOX_MODE=real once a PVE cluster with credentials is available.
 */
export class SimulatedProxmox implements ProxmoxAdapter {
  readonly mode = "simulated" as const;
  private nextVmId = 100;
  private readonly vms = new Map<string, SimVm>();

  private get(orderId: string): SimVm | null {
    return this.vms.get(orderId) ?? null;
  }

  async ensureVm(input: ProvisionInput): Promise<ProvisionedVm> {
    await sleep(150);
    const existing = this.get(input.orderId);
    if (existing) return { vmId: existing.vmId, node: existing.node };
    const vm: SimVm = {
      vmId: this.nextVmId++,
      node: input.hostname.endsWith("a") ? "sim-node-1" : "sim-node-2",
      orderId: input.orderId,
      hostname: input.hostname,
      running: false,
      createdAt: new Date(),
    };
    this.vms.set(input.orderId, vm);
    await sleep(200);
    return { vmId: vm.vmId, node: vm.node };
  }

  async waitHealthy(orderId: string, _timeoutMs: number): Promise<void> {
    const vm = this.get(orderId);
    if (!vm) throw new Error(`Simulated VM for order ${orderId} not found`);
    await sleep(150);
    vm.running = true;
  }

  async reboot(orderId: string): Promise<void> {
    const vm = this.get(orderId);
    if (!vm) return;
    await sleep(100);
    vm.running = true;
  }

  async reinstall(orderId: string, input: ProvisionInput): Promise<ProvisionedVm> {
    this.vms.delete(orderId);
    return this.ensureVm(input);
  }

  async destroy(orderId: string): Promise<void> {
    this.vms.delete(orderId);
  }

  async collectNodes(): Promise<NodeStatus[]> {
    const node1 = this.vms.size % 2 === 0;
    return [
      {
        nodeName: "sim-node-1",
        status: "online",
        cpuCores: 16,
        memoryTotalMb: 65536,
        memoryUsedMb: node1 ? 16384 : 20480,
        diskTotalGb: 1024,
        diskUsedGb: 320,
      },
      {
        nodeName: "sim-node-2",
        status: "online",
        cpuCores: 16,
        memoryTotalMb: 65536,
        memoryUsedMb: 12288,
        diskTotalGb: 1024,
        diskUsedGb: 280,
      },
    ];
  }
}