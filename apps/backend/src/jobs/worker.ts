import type { FastifyInstance } from "fastify";
import type { OperatingSystemId, PlanId, RegionId } from "@irctcrdp/contracts";
import { claimNextJobs, markJobCompleted, markJobFailed, markJobRetrying } from "./queue.js";
import { getOrderById } from "../orders/service.js";
import { getPlan } from "../products/catalog.js";
import { getTemplate } from "../templates/index.js";
import { reserveIp, releaseIp, getReservedByJobResult } from "../ipam/service.js";
import type { JobRow } from "./queue.js";

export interface WorkerHandle {
  stop: () => void;
}

/**
 * DB-backed provisioning worker. Claims queued/retrying jobs, reserves an IP,
 * marks the order PROVISIONING and hands the actual VM work to the isolated
 * provisioner service (which reports back via /internal/jobs/:id/result).
 * Retries use exponential backoff and are idempotent (unique order per job).
 */
export function startProvisioningWorker(app: FastifyInstance, intervalMs = 2000): WorkerHandle {
  const running = new Set<string>();

  const timer = setInterval(() => {
    void tick(app, running).catch((err) => {
      app.log.error({ err }, "provisioning worker tick failed");
    });
  }, intervalMs);
  timer.unref();

  return { stop: () => clearInterval(timer) };
}

async function tick(app: FastifyInstance, running: Set<string>): Promise<void> {
  const jobs = await claimNextJobs(app.ctx.db, 3);
  for (const job of jobs) {
    if (running.has(job.id)) continue;
    running.add(job.id);
    void processJob(app, job)
      .catch((err) => app.log.error({ err, jobId: job.id }, "job processing error"))
      .finally(() => running.delete(job.id));
  }
}

async function processJob(app: FastifyInstance, job: JobRow): Promise<void> {
  const { db, provisioner } = app.ctx;

  const order = await getOrderById(app.ctx, job.order_id);
  if (!order) {
    await markJobFailed(db, job.id, "Order not found");
    return;
  }
  if (order.status === "ACTIVE") {
    await markJobCompleted(db, job.id, { skipped: true, reason: "order already active" });
    return;
  }

  const plan = getPlan(order.plan_id);
  const template = getTemplate(order.os);
  if (!plan || !template) {
    await failJobWithRelease(app, job, "Unknown plan or OS template");
    return;
  }

  let ip = await getReservedByJobResult(db, job.result);
  if (!ip) {
    try {
      ip = await reserveIp(db, order.region as RegionId);
    } catch (err) {
      await failJobWithRelease(app, job, `IP reservation failed: ${(err as Error).message}`);
      return;
    }
    await db.execute("UPDATE provisioning_jobs SET result = ? WHERE id = ?", [
      JSON.stringify({ ipId: ip.id }),
      job.id,
    ]);
  }

  await db.execute(
    "UPDATE orders SET status = 'PROVISIONING' WHERE id = ? AND status IN ('PAID', 'PENDING_PAYMENT', 'PROVISIONING')",
    [order.id],
  );

  try {
    await provisioner.provision({
      jobId: job.id,
      orderId: order.id,
      planId: order.plan_id as PlanId,
      region: order.region as RegionId,
      os: order.os as OperatingSystemId,
      hostname: `rdp-${order.id.slice(0, 8)}`,
      cpuCores: plan.cpuCores,
      ramMB: plan.ramGB * 1024,
      diskGB: plan.storageGB,
      ipv4: ip.ipv4,
      gateway: ip.gateway,
      prefixLen: ip.prefixLen,
      dnsPrimary: ip.dnsPrimary,
      dnsSecondary: ip.dnsSecondary,
    });
    // Success: the provisioner delivers the result asynchronously via
    // POST /internal/jobs/:id/result.
  } catch (err) {
    const message = (err as Error).message;
    if (job.attempts >= job.max_attempts) {
      await failJobWithRelease(app, job, message);
    } else {
      await markJobRetrying(db, job.id, job.attempts, message, app.ctx.config.PROVISIONING_RETRY_BASE_SECONDS);
    }
  }
}

async function failJobWithRelease(app: FastifyInstance, job: JobRow, error: string): Promise<void> {
  const ip = await getReservedByJobResult(app.ctx.db, job.result);
  if (ip) await releaseIp(app.ctx.db, ip.id);
  await app.ctx.db.execute("UPDATE orders SET status = 'FAILED' WHERE id = ?", [job.order_id]);
  await markJobFailed(app.ctx.db, job.id, error);
}