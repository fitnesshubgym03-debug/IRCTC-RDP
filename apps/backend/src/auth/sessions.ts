import { createHash, randomBytes } from "node:crypto";
import type { Pool } from "../database/pool.js";

export const SESSION_COOKIE = "irctcrdp_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  emailVerified: boolean;
}

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  db: Pool,
  userId: string,
  ttlSeconds: number,
  ip: string | null,
  userAgent: string | null,
): Promise<string> {
  const token = newSessionToken();
  await db.execute(
    `INSERT INTO sessions (token_hash, user_id, ip, user_agent, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))`,
    [hashToken(token), userId, ip, userAgent?.slice(0, 255) ?? null, ttlSeconds],
  );
  return token;
}

export async function getSessionUser(db: Pool, token: string): Promise<SessionUser | null> {
  if (!token) return null;
  const [rows] = await db.execute<import("mysql2/promise").RowDataPacket[]>(
    `SELECT u.id, u.email, u.name, u.role, u.email_verified
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.revoked = 0 AND s.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as "customer" | "admin",
    emailVerified: Boolean(row.email_verified),
  };
}

export async function revokeSession(db: Pool, token: string): Promise<void> {
  await db.execute("UPDATE sessions SET revoked = 1 WHERE token_hash = ?", [hashToken(token)]);
}