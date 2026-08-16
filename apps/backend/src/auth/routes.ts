import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { loginSchema, registerSchema } from "@irctcrdp/validation";
import { hashPassword, verifyPassword } from "./passwords.js";
import { createSession, getSessionUser, revokeSession, SESSION_COOKIE } from "./sessions.js";
import { setSessionCookie, clearSessionCookie } from "../security/cookies.js";
import { requireAuth } from "../security/guards.js";
import { writeAudit } from "../audit/index.js";
import { clientIp } from "../context.js";
import { Errors } from "../errors.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const { db, config } = app.ctx;

  app.post(
    "/v1/auth/register",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(422).send({ error: "Invalid registration data", details: parsed.error.flatten() });
      }
      const { email, password, name } = parsed.data;

      const [existing] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );
      if (existing.length > 0) {
        return reply.code(409).send({ error: "An account with this email already exists", code: "EMAIL_TAKEN" });
      }

      const id = randomUUID();
      const passwordHash = await hashPassword(password);
      const role = config.ADMIN_EMAILS.includes(email) ? "admin" : "customer";
      await db.execute(
        "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        [id, email, name, passwordHash, role],
      );

      const token = await createSession(db, id, config.SESSION_TTL_SECONDS, clientIp(req), req.headers["user-agent"] ?? null);
      setSessionCookie(reply, token, config);
      writeAudit(db, { actorType: "user", actorId: id, action: "auth.register", requestId: req.id, ip: clientIp(req) });

      return reply.code(201).send({ user: { id, email, name, role, emailVerified: false } });
    },
  );

  app.post(
    "/v1/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(422).send({ error: "Invalid login data", details: parsed.error.flatten() });
      }
      const { email, password } = parsed.data;

      const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT id, email, name, password_hash, role, email_verified FROM users WHERE email = ? LIMIT 1",
        [email],
      );
      const row = rows[0];
      if (!row || !(await verifyPassword(password, row.password_hash as string))) {
        return reply.code(401).send({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
      }

      const token = await createSession(db, row.id as string, config.SESSION_TTL_SECONDS, clientIp(req), req.headers["user-agent"] ?? null);
      setSessionCookie(reply, token, config);
      writeAudit(db, { actorType: "user", actorId: row.id as string, action: "auth.login", requestId: req.id, ip: clientIp(req) });

      return reply.send({
        user: {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role,
          emailVerified: Boolean(row.email_verified),
        },
      });
    },
  );

  app.post("/v1/auth/logout", async (req, reply) => {
    const token = (req.cookies as Record<string, string | undefined>)[SESSION_COOKIE];
    if (token) await revokeSession(db, token);
    clearSessionCookie(reply, config);
    return reply.send({ ok: true });
  });

  app.get("/v1/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    return reply.send({ user: req.user });
  });
}