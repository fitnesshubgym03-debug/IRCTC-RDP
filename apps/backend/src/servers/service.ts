import type { FastifyInstance } from "fastify";
import { getOrderById } from "../orders/service.js";
import { writeAudit } from "../audit/index.js";
import { clientIp } from "../context.js";
import { Errors } from "../errors.js";

export interface ServerRow {
  id: string;
  order_id: string;
  user_id: string | null;
  status: string;
  hostname: string;
  ipv4: string | null;
  os: string;
  cpu_cores: number;
  ram_gb: number;
  region: string;
  rdp_port: number | null;
  proxmox_vm_id: number | null;
  node: string | null;
  created_at: Date | string;
}

export async function getServerByOrderId(db: FastifyInstance["ctx"]["db"], orderId: string): Promise<ServerRow | null> {
  const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
    "SELECT * FROM servers WHERE order_id = ? LIMIT 1",
    [orderId],
  );
  return (rows[0] as ServerRow) ?? null;
}

export function serverToPublic(server: ServerRow): Record<string, unknown> {
  return {
    id: server.id,
    orderId: server.order_id,
    status: server.status,
    hostname: server.hostname,
    ipv4: server.ipv4,
    os: server.os,
    cpuCores: server.cpu_cores,
    ramGB: server.ram_gb,
    region: server.region,
    rdpPort: server.rdp_port,
    createdAt: server.created_at,
  };
}

export async function serverRoutes(app: FastifyInstance): Promise<void> {
  const { db, provisioner } = app.ctx;

  app.get("/v1/servers", async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: "Unauthorized" });
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT * FROM servers WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    return reply.send({ servers: (rows as ServerRow[]).map(serverToPublic) });
  });

  app.get("/v1/servers/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT * FROM servers WHERE id = ? LIMIT 1",
      [id],
    );
    const server = rows[0] as ServerRow | undefined;
    if (!server) return reply.code(404).send({ error: "Server not found" });
    if (req.user && server.user_id !== null && server.user_id !== req.user.id) {
      return reply.code(403).send({ error: "Forbidden" });
    }
    return reply.send({ server: serverToPublic(server) });
  });

  for (const action of ["reboot", "reinstall"] as const) {
    app.post(`/v1/servers/:id/${action}`, async (req, reply) => {
      const { id } = req.params as { id: string };
      const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT * FROM servers WHERE id = ? LIMIT 1",
        [id],
      );
      const server = rows[0] as ServerRow | undefined;
      if (!server) return reply.code(404).send({ error: "Server not found" });
      if (req.user && server.user_id !== null && server.user_id !== req.user.id) {
        return reply.code(403).send({ error: "Forbidden" });
      }
      if (server.status !== "ACTIVE" && server.status !== "SUSPENDED") {
        return reply.code(409).send({ error: `Cannot ${action} a server in state ${server.status}` });
      }

      const result = await provisioner.action(action, {
        orderId: server.order_id,
        hostname: server.hostname,
        ipv4: server.ipv4,
      });
      await db.execute("UPDATE servers SET status = ? WHERE id = ?", [action === "reboot" ? "REBOOTING" : "REINSTALLING", id]);
      writeAudit(db, {
        actorType: "user",
        actorId: req.user?.id ?? null,
        action: `server.${action}`,
        resourceType: "server",
        resourceId: id,
        requestId: req.id,
        ip: clientIp(req),
      });
      return reply.send({ ok: result.ok, status: action === "reboot" ? "REBOOTING" : "REINSTALLING" });
    });
  }

  // Dashboard order ownership helper: an order's server
  app.get("/v1/orders/:id/server", async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await getOrderById(app.ctx, id);
    if (!order) return reply.code(404).send({ error: "Order not found" });
    if (req.user && order.user_id !== null && order.user_id !== req.user.id) {
      return reply.code(403).send({ error: "Forbidden" });
    }
    const server = await getServerByOrderId(db, id);
    if (!server) return reply.code(404).send({ error: "Server not found yet" });
    return reply.send({ server: serverToPublic(server) });
  });

  void Errors;
}