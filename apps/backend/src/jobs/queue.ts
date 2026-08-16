import { randomUUID } from "node:crypto";
import type { Pool } from "../database/pool.js";
import type { JobStatus } from "@irctcrdp/contracts";

export interface JobRow {
  id: string;
  order_id: string;
  job_type: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  next_run_at: Date | string | null;
  last_error: string | null;
  result: string | null;
}

/** Idempotent enqueue — at most one job per order (unique order_id). */
export async function enqueueProvisioningJob(db: Pool, orderId: string, jobType = "provision_server"): Promise<void> {
  await db.execute(
    `INSERT IGNORE INTO provisioning_jobs (id, order_id, job_type, status)
     VALUES (?, ?, ?, 'queued')`,
    [randomUUID(), orderId, jobType],
  );
}

export async function claimNextJobs(db: Pool, limit = 3): Promise<JobRow[]> {
  const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
    `SELECT * FROM provisioning_jobs
     WHERE status IN ('queued', 'retrying')
       AND (next_run_at IS NULL OR next_run_at <= NOW())
     ORDER BY created_at ASC
     LIMIT ?`,
    [limit],
  );
  const claimed: JobRow[] = [];
  for (const row of rows as JobRow[]) {
    const [res] = await db.execute(
      `UPDATE provisioning_jobs SET status = 'processing', attempts = attempts + 1
       WHERE id = ? AND status IN ('queued', 'retrying')`,
      [row.id],
    );
    if ((res as { affectedRows: number }).affectedRows === 1) {
      claimed.push({ ...row, status: "processing", attempts: row.attempts + 1 });
    }
  }
  return claimed;
}

export async function markJobProcessing(db: Pool, jobId: string): Promise<boolean> {
  const [res] = await db.execute(
    "UPDATE provisioning_jobs SET status = 'processing', attempts = attempts + 1 WHERE id = ? AND status IN ('queued','retrying')",
    [jobId],
  );
  return (res as { affectedRows: number }).affectedRows === 1;
}

export async function markJobRetrying(db: Pool, jobId: string, attempts: number, error: string): Promise<void> {
  const delaySeconds = Math.min(300, 5 * 2 ** attempts);
  await db.execute(
    `UPDATE provisioning_jobs
     SET status = 'retrying', last_error = ?, next_run_at = DATE_ADD(NOW(), INTERVAL ? SECOND)
     WHERE id = ?`,
    [error.slice(0, 500), delaySeconds, jobId],
  );
}

export async function markJobFailed(db: Pool, jobId: string, error: string): Promise<void> {
  await db.execute("UPDATE provisioning_jobs SET status = 'failed', last_error = ? WHERE id = ?", [
    error.slice(0, 500),
    jobId,
  ]);
}

export async function markJobCompleted(db: Pool, jobId: string, result: unknown): Promise<void> {
  await db.execute("UPDATE provisioning_jobs SET status = 'completed', result = ?, last_error = NULL WHERE id = ?", [
    JSON.stringify(result),
    jobId,
  ]);
}

export async function getJobByOrderId(db: Pool, orderId: string): Promise<JobRow | null> {
  const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
    "SELECT * FROM provisioning_jobs WHERE order_id = ? LIMIT 1",
    [orderId],
  );
  return (rows[0] as JobRow) ?? null;
}