import { createHmac } from "node:crypto";
import mysql from "mysql2/promise";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { loadConfig, type Config } from "../src/config.js";
import { migrate } from "../src/database/migrate.js";
import type { Pool } from "../src/database/pool.js";
import type { RazorpayClient } from "../src/payments/razorpay.js";
import type { ProvisionerClient } from "../src/provisioning/client.js";
import { startProvisioningWorker, type WorkerHandle } from "../src/jobs/worker.js";
import { syncProducts } from "../src/products/sync.js";

export const TEST_DB = "irctcrdp_test";
const BASE_URL = `mysql://irctcrdp:irctcrdp_2026_secure@localhost:3306/${TEST_DB}`;

export const SESSION_SECRET = "test-session-secret-0123456789abcdef0123456789abcdef";
export const INTERNAL_SECRET = "test-internal-secret-0123456789abcdef0123456789abcdef";
export const RZP_KEY_ID = "rzp_test_testkey";
export const RZP_KEY_SECRET = "test-razorpay-key-secret";
export const RZP_WEBHOOK_SECRET = "test-razorpay-webhook-secret";

export class FakeRazorpayClient implements RazorpayClient {
  fetchPaymentOverride: ((paymentId: string) => Promise<{
    amount: number;
    status: string;
    currency?: string;
  } | null>) | null = null;

  async createOrder(input: { amountPaise: number; receipt: string }) {
    return { id: `ord_sim_${input.receipt.slice(0, 8)}`, amount: input.amountPaise, currency: "INR", receipt: input.receipt };
  }

  async fetchPayment(paymentId: string) {
    if (this.fetchPaymentOverride) return this.fetchPaymentOverride(paymentId);
    const amount = Number(paymentId.split("_")[2] ?? 0);
    return { id: paymentId, amount, currency: "INR", status: "captured" };
  }
}

export class FakeProvisionerClient implements ProvisionerClient {
  failCount = 0;
  failWith: Error | null = null;
  app: { inject: (opts: unknown) => Promise<{ ok: boolean }> } | null = null;

  async provision(input: { jobId: string; hostname: string; ipv4: string }) {
    if (this.failWith) throw this.failWith;
    if (this.failCount > 0) {
      this.failCount -= 1;
      throw new Error("provisioner timeout");
    }
    // Emulate the real provisioner: report the completed VM back to the
    // backend internal API so the job can finish.
    if (this.app) {
      await this.app.inject({
        method: "POST",
        url: `/internal/jobs/${input.jobId}/result`,
        headers: { "content-type": "application/json", "x-internal-secret": INTERNAL_SECRET },
        payload: {
          jobId: input.jobId,
          status: "completed",
          server: {
            hostname: input.hostname,
            ipv4: input.ipv4,
            rdpPort: 3389,
            proxmoxVmId: 100 + Number(input.jobId.length),
            node: "sim-node",
          },
        },
      });
    }
    return { ok: true };
  }

  async action() {
    return { ok: true, action: "noop" };
  }

  async ping() {
    return true;
  }
}

export interface TestEnv {
  app: FastifyInstance;
  config: Config;
  pool: Pool;
  razorpay: FakeRazorpayClient;
  provisioner: FakeProvisionerClient;
  worker: WorkerHandle;
}

let seeded = false;

export async function setupTestDb(): Promise<Pool> {
  const pool = mysql.createPool({ uri: `${BASE_URL}?multipleStatements=true`, connectionLimit: 5 }) as Pool;
  await migrate(pool);
  return pool;
}

export async function resetTestDb(pool: Pool): Promise<void> {
  await pool.query(
    `SET FOREIGN_KEY_CHECKS = 0;
     TRUNCATE audit_logs; TRUNCATE payment_events; TRUNCATE payments; TRUNCATE subscriptions;
     TRUNCATE servers; TRUNCATE provisioning_jobs; TRUNCATE orders; TRUNCATE sessions;
     TRUNCATE ip_addresses; TRUNCATE users;
     SET FOREIGN_KEY_CHECKS = 1;`,
  );
  await syncProducts(pool);
  await seedIps(pool);
}

async function seedIps(pool: Pool): Promise<void> {
  await pool.query(
    `INSERT INTO ip_addresses (region, ipv4, gateway, status) VALUES
     ('mumbai', '10.10.0.10', '10.10.0.1', 'free'), ('mumbai', '10.10.0.11', '10.10.0.1', 'free'),
     ('bangalore', '10.20.0.10', '10.20.0.1', 'free'), ('delhi', '10.30.0.10', '10.30.0.1', 'free'),
     ('mumbai', '10.10.0.12', '10.10.0.1', 'free'), ('delhi', '10.30.0.11', '10.30.0.1', 'free')`,
  );
}

export async function createTestApp(): Promise<TestEnv> {
  if (!seeded) {
    const seedPool = await setupTestDb();
    await resetTestDb(seedPool);
    await seedPool.end();
    seeded = true;
  }

  const config = loadTestConfig();

  const pool = await setupTestDb();
  await resetTestDb(pool);

  const razorpay = new FakeRazorpayClient();
  const provisioner = new FakeProvisionerClient();
  const app = await buildApp({ config, pool, razorpayClient: razorpay, provisionerClient: provisioner, logger: false });
  provisioner.app = app;
  const worker = startProvisioningWorker(app, 50);

  return { app, config, pool, razorpay, provisioner, worker };
}

export function loadTestConfig() { return loadConfig({ NODE_ENV: "test", HOST: "127.0.0.1", PORT: "4000", MYSQL_URL: BASE_URL, SESSION_SECRET, INTERNAL_API_SECRET: INTERNAL_SECRET, RAZORPAY_KEY_ID: RZP_KEY_ID, RAZORPAY_KEY_SECRET: RZP_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET: RZP_WEBHOOK_SECRET, RAZORPAY_MODE: "test", COOKIE_DOMAIN: "", CORS_ORIGINS: "https://irctcrdp.com", DB_POOL_SIZE: "5", PROVISIONING_MAX_ATTEMPTS: "3", PROVISIONING_RETRY_BASE_SECONDS: "1" } as NodeJS.ProcessEnv); }

export function signPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function paymentSignature(orderId: string, paymentId: string): string {
  return signPayload(RZP_KEY_SECRET, `${orderId}|${paymentId}`);
}

export function makePaymentId(amountPaise: number): string {
  return `pay_sim_${amountPaise}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function waitFor(
  fn: () => Promise<boolean>,
  timeoutMs = 8000,
  intervalMs = 100,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await sleep(intervalMs);
  }
  throw new Error("waitFor: condition not met within timeout");
}

export async function registerUser(app: FastifyInstance, email = "buyer@test.com") {
  return app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { name: "Test Buyer", email, phone: "+91 90000 00000", address: "1 Main Street", password: "Str0ngPass!word" },
  });
}