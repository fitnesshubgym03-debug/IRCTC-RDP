import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../security/guards.js";
import { writeAudit } from "../audit/index.js";
import { clientIp } from "../context.js";
import { getServerByOrderId } from "../servers/service.js";
import { releaseIp, getReservedByJobResult } from "../ipam/service.js";

function pageParams(query: Record<string, unknown>): { limit: number; offset: number } {
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, offset: (page - 1) * limit };
}

function queryOf(req: { query: unknown }): Record<string, unknown> {
  return (req.query as Record<string, unknown> | undefined) ?? {};
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const { db, provisioner } = app.ctx;

  const adminList = async (req: { query: unknown }, table: string, orderBy = "created_at DESC") => {
    const { limit, offset } = pageParams(queryOf(req));
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      `SELECT * FROM ${table} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  };

  app.get("/admin/customers", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "users");
    writeAudit(db, { actorType: "user", actorId: req.user!.id, action: "admin.customers.list", requestId: req.id, ip: clientIp(req) });
    return reply.send({ customers: rows });
  });

  app.get("/admin/orders", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "orders");
    return reply.send({ orders: rows });
  });

  app.get("/admin/payments", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "payments");
    return reply.send({ payments: rows });
  });

  app.get("/admin/servers", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "servers");
    return reply.send({ servers: rows });
  });

  app.get("/admin/nodes", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "proxmox_nodes", "node_name ASC");
    return reply.send({ nodes: rows });
  });

  app.get("/admin/jobs", { preHandler: requireAdmin }, async (req, reply) => {
    const rows = await adminList(req, "provisioning_jobs");
    return reply.send({ jobs: rows });
  });

  app.post("/admin/jobs/:id/retry", { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await db.execute(
      "UPDATE provisioning_jobs SET status = 'queued', next_run_at = NULL, last_error = NULL WHERE id = ?",
      [id],
    );
    writeAudit(db, {
      actorType: "user",
      actorId: req.user!.id,
      action: "admin.job.retry",
      resourceType: "job",
      resourceId: id,
      requestId: req.id,
      ip: clientIp(req),
    });
    return reply.send({ ok: true });
  });

  for (const action of ["suspend", "resume"] as const) {
    app.post(`/admin/servers/:id/${action}`, { preHandler: requireAdmin }, async (req, reply) => {
      const { id } = req.params as { id: string };
      const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT * FROM servers WHERE id = ? LIMIT 1",
        [id],
      );
      const server = rows[0] as { order_id: string } | undefined;
      if (!server) return reply.code(404).send({ error: "Server not found" });
      const orderStatus = action === "suspend" ? "SUSPENDED" : "ACTIVE";
      const serverStatus = action === "suspend" ? "SUSPENDED" : "ACTIVE";
      await db.execute("UPDATE orders SET status = ? WHERE id = ?", [orderStatus, server.order_id]);
      await db.execute("UPDATE servers SET status = ? WHERE id = ?", [serverStatus, id]);
      writeAudit(db, {
        actorType: "user",
        actorId: req.user!.id,
        action: `admin.server.${action}`,
        resourceType: "server",
        resourceId: id,
        requestId: req.id,
        ip: clientIp(req),
      });
      return reply.send({ ok: true });
    });
  }

  for (const action of ["reboot", "reinstall"] as const) {
    app.post(`/admin/servers/:id/${action}`, { preHandler: requireAdmin }, async (req, reply) => {
      const { id } = req.params as { id: string };
      const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT * FROM servers WHERE id = ? LIMIT 1",
        [id],
      );
      const server = rows[0] as { order_id: string; hostname: string; ipv4: string | null } | undefined;
      if (!server) return reply.code(404).send({ error: "Server not found" });
      await provisioner.action(action, { orderId: server.order_id, hostname: server.hostname, ipv4: server.ipv4 });
      await db.execute("UPDATE servers SET status = ? WHERE id = ?", [action === "reboot" ? "REBOOTING" : "REINSTALLING", id]);
      writeAudit(db, {
        actorType: "user",
        actorId: req.user!.id,
        action: `admin.server.${action}`,
        resourceType: "server",
        resourceId: id,
        requestId: req.id,
        ip: clientIp(req),
      });
      return reply.send({ ok: true });
    });
  }

  app.post("/admin/servers/:id/terminate", { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT * FROM servers WHERE id = ? LIMIT 1",
      [id],
    );
    const server = rows[0] as { order_id: string; hostname: string; ipv4: string | null } | undefined;
    if (!server) return reply.code(404).send({ error: "Server not found" });

    const [jobRows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT result FROM provisioning_jobs WHERE order_id = ? LIMIT 1",
      [server.order_id],
    );
    const ip = await getReservedByJobResult(db, (jobRows[0]?.result as string | null) ?? null);
    if (ip) await releaseIp(db, ip.id);

    await provisioner.action("terminate", { orderId: server.order_id, hostname: server.hostname, ipv4: server.ipv4 });
    await db.execute("UPDATE orders SET status = 'TERMINATED' WHERE id = ?", [server.order_id]);
    await db.execute("UPDATE servers SET status = 'TERMINATED' WHERE id = ?", [id]);
    await db.execute("UPDATE subscriptions SET status = 'terminated' WHERE order_id = ?", [server.order_id]);
    writeAudit(db, {
      actorType: "user",
      actorId: req.user!.id,
      action: "admin.server.terminate",
      resourceType: "server",
      resourceId: id,
      requestId: req.id,
      ip: clientIp(req),
    });
    return reply.send({ ok: true });
  });

  app.get("/admin/logs", { preHandler: requireAdmin }, async (req, reply) => {
    const query = queryOf(req);
    const { limit, offset } = pageParams(query);
    const resourceType = typeof query.resourceType === "string" ? query.resourceType : null;
    const resourceId = typeof query.resourceId === "string" ? query.resourceId : null;
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      `SELECT * FROM audit_logs
       WHERE (? IS NULL OR resource_type = ?) AND (? IS NULL OR resource_id = ?)
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [resourceType, resourceType, resourceId, resourceId, limit, offset],
    );
    return reply.send({ logs: rows });
  });
}