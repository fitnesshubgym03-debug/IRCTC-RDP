import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { internalJobResultSchema } from "@irctcrdp/validation";
import { getJobByOrderId, markJobCompleted, markJobFailed, markJobRetrying } from "../jobs/queue.js";
import { getOrderById, markOrderPaid } from "../orders/service.js";
import { getPlan } from "../products/catalog.js";
import { getTemplate } from "../templates/index.js";
import { allocateIp, releaseIp, getReservedByJobResult } from "../ipam/service.js";
import { writeAudit } from "../audit/index.js";

/**
 * Internal service-to-service API. Bound to loopback + INTERNAL_API_SECRET.
 * Never exposed to the browser via nginx or Cloudflare.
 */
export async function internalRoutes(app: FastifyInstance): Promise<void> {
  const { db, config } = app.ctx;

  await app.register(async (scope) => {
    scope.addHook("preHandler", async (req, reply) => {
      const ip = req.ip;
      const loopback = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
      if (!loopback) {
        return reply.code(403).send({ error: "Forbidden" });
      }
      if (req.headers["x-internal-secret"] !== config.INTERNAL_API_SECRET) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
    });

    scope.post("/internal/jobs/:id/result", async (req, reply) => {
      const { id: jobId } = req.params as { id: string };
      const parsed = internalJobResultSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(422).send({ error: "Invalid result payload" });

      const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT * FROM provisioning_jobs WHERE id = ? LIMIT 1",
        [jobId],
      );
      const job = rows[0] as
        | { id: string; order_id: string; status: string; attempts: number; result: string | null }
        | undefined;
      if (!job) return reply.code(404).send({ error: "Job not found" });

      const input = parsed.data;

      if (input.status === "completed") {
        const server = input.server;
        if (!server) return reply.code(422).send({ error: "completed result requires server" });

        const [existing] = await db.query<import("mysql2/promise").RowDataPacket[]>(
          "SELECT id FROM servers WHERE order_id = ? LIMIT 1",
          [job.order_id],
        );
        let serverId: string;
        if (existing.length === 0) {
          const order = await getOrderById(app.ctx, job.order_id);
          if (!order) return reply.code(404).send({ error: "Order not found" });
          const plan = getPlan(order.plan_id);
          const template = getTemplate(order.os);
          if (!plan || !template) {
            await db.execute("UPDATE orders SET status = 'FAILED' WHERE id = ?", [job.order_id]);
            await markJobFailed(db, job.id, "Unknown plan or template on completion");
            return reply.send({ ok: true, ignored: true });
          }
          serverId = randomUUID();
          await db.execute(
            `INSERT INTO servers
               (id, order_id, user_id, status, hostname, ipv4, os, cpu_cores, ram_gb, region, rdp_port, proxmox_vm_id, node)
             VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              serverId,
              job.order_id,
              order.user_id,
              server.hostname,
              server.ipv4,
              order.os,
              plan.cpuCores,
              plan.ramGB,
              order.region,
              server.rdpPort ?? template.rdpPort,
              server.proxmoxVmId ?? null,
              server.node ?? null,
            ],
          );
          const ip = await getReservedByJobResult(db, job.result);
          if (ip) await allocateIp(db, ip.id, serverId);
          await db.execute("UPDATE orders SET status = 'ACTIVE' WHERE id = ?", [job.order_id]);
          await db.execute(
            "INSERT INTO subscriptions (id, order_id, billing_cycle, current_period_start, current_period_end) VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH))",
            [randomUUID(), job.order_id, order.billing_cycle],
          );
        } else {
          serverId = (existing[0] as { id: string }).id;
        }
        await markJobCompleted(db, job.id, server);
        writeAudit(db, {
          actorType: "internal",
          action: "provisioning.completed",
          resourceType: "order",
          resourceId: job.order_id,
          meta: { serverId },
        });
        return reply.send({ ok: true });
      }

      if (input.status === "failed") {
        const ip = await getReservedByJobResult(db, job.result);
        if (ip) await releaseIp(db, ip.id);
        await db.execute("UPDATE orders SET status = 'FAILED' WHERE id = ? AND status IN ('PAID', 'PROVISIONING')", [
          job.order_id,
        ]);
        await markJobFailed(db, job.id, input.error ?? "Provisioning failed");
        writeAudit(db, {
          actorType: "internal",
          action: "provisioning.failed",
          resourceType: "order",
          resourceId: job.order_id,
          meta: { error: input.error },
        });
        return reply.send({ ok: true });
      }

      if (input.status === "retrying") {
        const current = await getJobByOrderId(db, job.order_id);
        await markJobRetrying(db, job.id, current?.attempts ?? job.attempts, input.error ?? "Retrying");
        return reply.send({ ok: true });
      }

      return reply.code(422).send({ error: "Unsupported status" });
    });

    scope.post("/internal/nodes", async (req, reply) => {
      const body = req.body as {
        nodes?: Array<{
          node_name: string;
          status?: string;
          cpu_cores?: number | null;
          memory_total_mb?: number | null;
          memory_used_mb?: number | null;
          disk_total_gb?: number | null;
          disk_used_gb?: number | null;
        }>;
      };
      if (!Array.isArray(body?.nodes)) return reply.code(422).send({ error: "nodes array required" });
      for (const node of body.nodes) {
        if (!node?.node_name) continue;
        await db.execute(
          `INSERT INTO proxmox_nodes (id, node_name, status, cpu_cores, memory_total_mb, memory_used_mb, disk_total_gb, disk_used_gb, last_checked_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             status = VALUES(status), cpu_cores = VALUES(cpu_cores), memory_total_mb = VALUES(memory_total_mb),
             memory_used_mb = VALUES(memory_used_mb), disk_total_gb = VALUES(disk_total_gb),
             disk_used_gb = VALUES(disk_used_gb), last_checked_at = NOW()`,
          [
            randomUUID(),
            node.node_name,
            node.status ?? "unknown",
            node.cpu_cores ?? null,
            node.memory_total_mb ?? null,
            node.memory_used_mb ?? null,
            node.disk_total_gb ?? null,
            node.disk_used_gb ?? null,
          ],
        );
      }
      return reply.send({ ok: true, count: body.nodes.length });
    });
  });
}