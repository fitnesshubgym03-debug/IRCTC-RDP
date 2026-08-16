import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const { db, provisioner } = app.ctx;

  app.get("/health", async (_req, reply) => {
    return reply.send({ status: "ok", uptime: process.uptime(), time: new Date().toISOString() });
  });

  app.get("/health/ready", async (_req, reply) => {
    let dbOk = true;
    try {
      await db.query("SELECT 1");
    } catch {
      dbOk = false;
    }
    const provisionerOk = await provisioner.ping();
    if (!dbOk || !provisionerOk) {
      return reply.code(503).send({ status: "not_ready", db: dbOk, provisioner: provisionerOk });
    }
    return reply.send({ status: "ready", db: true, provisioner: true });
  });
}