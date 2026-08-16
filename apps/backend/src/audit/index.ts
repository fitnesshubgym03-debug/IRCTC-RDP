import type { Pool } from "../database/pool.js";

export interface AuditEntry {
  actorType?: "user" | "system" | "internal";
  actorId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  requestId?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown> | null;
}

/** Fire-and-forget audit write; never fails the request it is called from. */
export function writeAudit(db: Pool, entry: AuditEntry): void {
  db.execute(
    `INSERT INTO audit_logs (actor_type, actor_id, action, resource_type, resource_id, request_id, ip, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.actorType ?? "system",
      entry.actorId ?? null,
      entry.action,
      entry.resourceType ?? null,
      entry.resourceId ?? null,
      entry.requestId ?? null,
      entry.ip ?? null,
      entry.meta ? JSON.stringify(entry.meta) : null,
    ],
  ).catch(() => {
    /* audit must never break the main flow */
  });
}