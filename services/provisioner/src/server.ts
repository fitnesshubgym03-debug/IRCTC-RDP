import Fastify, { type FastifyInstance } from "fastify";
import { internalActionSchema, provisionRequestSchema } from "@irctcrdp/validation";
import { buildTemplates } from "./templates.js";
import { loadConfig, type ProvisionerConfig } from "./config.js";
import type { ProxmoxAdapter } from "./proxmox/types.js";
import { ProxmoxClient } from "./proxmox/client.js";
import { SimulatedProxmox } from "./proxmox/simulated.js";

function callbackHeaders(config: ProvisionerConfig): Record<string, string> {
  return { "content-type": "application/json", "x-internal-secret": config.INTERNAL_API_SECRET };
}

export async function buildProvisionerApp(config: ProvisionerConfig): Promise<FastifyInstance> {
  const adapter: ProxmoxAdapter =
    config.PROXMOX_MODE === "real" ? new ProxmoxClient(config) : new SimulatedProxmox();
  const templates = buildTemplates(config);

  const app = Fastify({
    logger: { level: config.NODE_ENV === "production" ? "info" : "debug" },
    bodyLimit: 64 * 1024,
  });

  const reportResult = async (payload: unknown): Promise<void> => {
    const res = await fetch(`${config.BACKEND_URL}/internal/jobs/${(payload as { jobId: string }).jobId}/result`, {
      method: "POST",
      headers: callbackHeaders(config),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`backend callback failed (${res.status})`);
  };

  app.addHook("preHandler", async (req, reply) => {
    if (req.url === "/health") return; // unauthenticated liveness probe
    const loopback = req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1";
    if (!loopback) return reply.code(403).send({ error: "Forbidden" });
    if (req.headers["x-internal-secret"] !== config.INTERNAL_API_SECRET) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.get("/health", async () => ({ status: "ok", mode: adapter.mode }));

  app.post("/internal/provision", async (req, reply) => {
    const parsed = provisionRequestSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(422).send({ error: "Invalid provision request", details: parsed.error.flatten() });
    const input = parsed.data;

    const template = templates[input.os];
    if (!template) return reply.code(422).send({ error: `Unsupported OS: ${input.os}` });

    try {
      const vm = await adapter.ensureVm({
        orderId: input.orderId,
        hostname: input.hostname,
        templateId: template.templateId,
        cpuCores: input.cpuCores,
        ramMB: input.ramMB,
        diskGB: input.diskGB,
        ipv4: input.ipv4,
        gateway: input.gateway,
        prefixLen: input.prefixLen,
        dnsPrimary: input.dnsPrimary,
        dnsSecondary: input.dnsSecondary,
        windows: template.windows,
      });
      await adapter.waitHealthy(input.orderId, config.HEALTH_CHECK_TIMEOUT_MS);
      await reportResult({
        jobId: input.jobId,
        status: "completed",
        server: {
          hostname: input.hostname,
          ipv4: input.ipv4,
          rdpPort: template.rdpPort,
          proxmoxVmId: vm.vmId,
          node: vm.node,
        },
      });
      return reply.send({ ok: true });
    } catch (err) {
      const message = (err as Error).message;
      req.log.error({ err, orderId: input.orderId }, "provisioning failed");
      await reportResult({
        jobId: input.jobId,
        status: "failed",
        error: message.slice(0, 450),
      }).catch(() => {});
      return reply.code(502).send({ ok: false, error: message });
    }
  });

  app.post("/internal/actions", async (req, reply) => {
    const parsed = internalActionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(422).send({ error: "Invalid action request" });
    const { action, server, provision } = parsed.data;
    try {
      switch (action) {
        case "reboot":
          await adapter.reboot(server.orderId);
          break;
        case "terminate":
          await adapter.destroy(server.orderId);
          break;
        case "reinstall": {
          if (!provision) return reply.code(422).send({ error: "reinstall requires provision payload" });
          const template = templates[provision.os];
          if (!template) return reply.code(422).send({ error: `Unsupported OS: ${provision.os}` });
          await adapter.reinstall(server.orderId, {
            orderId: provision.orderId,
            hostname: provision.hostname,
            templateId: template.templateId,
            cpuCores: provision.cpuCores,
            ramMB: provision.ramMB,
            diskGB: provision.diskGB,
            ipv4: provision.ipv4,
            gateway: provision.gateway,
            prefixLen: provision.prefixLen,
            dnsPrimary: provision.dnsPrimary,
            dnsSecondary: provision.dnsSecondary,
            windows: template.windows,
          });
          break;
        }
      }
      return reply.send({ ok: true, action });
    } catch (err) {
      req.log.error({ err, action }, "action failed");
      return reply.code(502).send({ ok: false, error: (err as Error).message });
    }
  });

  // Periodic node health sync to the backend (/internal/nodes).
  const syncNodes = async (): Promise<void> => {
    try {
      const nodes = await adapter.collectNodes();
      await fetch(`${config.BACKEND_URL}/internal/nodes`, {
        method: "POST",
        headers: callbackHeaders(config),
        body: JSON.stringify({ nodes }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      app.log.warn({ err }, "node sync failed");
    }
  };
  const syncTimer = setInterval(() => void syncNodes(), 60_000);
  syncTimer.unref();
  void syncNodes();

  app.addHook("onClose", async () => {
    clearInterval(syncTimer);
  });

  return app;
}

export async function main(): Promise<void> {
  const config = loadConfig();
  const app = await buildProvisionerApp(config);
  await app.listen({ host: config.HOST, port: config.PORT });
  app.log.info(`provisioner listening on ${config.HOST}:${config.PORT} (mode: ${config.PROXMOX_MODE})`);
}

if (process.argv[1]?.endsWith("server.js") || process.argv[1]?.endsWith("server.ts")) {
  main().catch((err) => {
    console.error("[provisioner] fatal startup error:", err.message);
    process.exit(1);
  });
}