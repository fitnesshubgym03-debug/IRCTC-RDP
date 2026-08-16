import type { FastifyReply, FastifyRequest } from "fastify";
import { SESSION_COOKIE, getSessionUser } from "../auth/sessions.js";
import { Errors } from "../errors.js";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = (req.cookies as Record<string, string | undefined>)[SESSION_COOKIE];
  const user = token ? await getSessionUser(req.server.ctx.db, token) : null;
  if (!user) {
    await reply.code(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    return;
  }
  req.user = user;
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(req, reply);
  if (reply.sent) return;
  if (req.user?.role !== "admin") {
    await reply.code(403).send({ error: "Forbidden", code: "FORBIDDEN" });
  }
}

export { Errors };