import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  createTestApp,
  resetTestDb,
  paymentSignature,
  makePaymentId,
  waitFor,
  type TestEnv,
} from "./helpers.js";

let env: TestEnv;

beforeAll(async () => {
  env = await createTestApp();
});

afterAll(async () => {
  env.worker.stop();
  await env.app.close();
  await env.pool.end();
});

beforeEach(async () => {
  await resetTestDb(env.pool);
  env.provisioner.failCount = 0;
  env.provisioner.failWith = null;
});

async function payForOrder() {
  const created = await env.app.inject({
    method: "POST",
    url: "/v1/orders",
    payload: { planId: "intel-6c-16gb", region: "mumbai", os: "windows-server-2022", billingCycle: "monthly" },
  });
  const { order, checkout } = created.json();
  const paymentId = makePaymentId(checkout.amountINR * 100);
  await env.app.inject({
    method: "POST",
    url: `/v1/orders/${order.id}/payment`,
    payload: {
      orderId: order.id,
      razorpayOrderId: checkout.razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: paymentSignature(checkout.razorpayOrderId, paymentId),
    },
  });
  return order.id;
}

describe("provisioning pipeline", () => {
  it("provisions a server end-to-end: order → paid → job → ACTIVE with an IP", async () => {
    const orderId = await payForOrder();

    await waitFor(async () => {
      const res = await env.app.inject({ method: "GET", url: `/v1/orders/${orderId}` });
      return res.json().order.status === "ACTIVE";
    });

    const [rows] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      `SELECT s.status AS s, s.ipv4, s.hostname, s.proxmox_vm_id, s.node,
              j.status AS j, i.status AS ip_status
       FROM servers s
       JOIN provisioning_jobs j ON j.order_id = s.order_id
       JOIN ip_addresses i ON i.ipv4 = s.ipv4
       WHERE s.order_id = ?`,
      [orderId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].s).toBe("ACTIVE");
    expect(rows[0].j).toBe("completed");
    expect(rows[0].ip_status).toBe("allocated");
    expect(rows[0].ipv4).toMatch(/^10\.(10|20|30)\.0\./);
    expect(rows[0].proxmox_vm_id).toBeTypeOf("number");
  });

  it("fails the order and releases the IP when provisioning fails", async () => {
    env.provisioner.failWith = new Error("provisioner timeout");
    const orderId = await payForOrder();

    await waitFor(async () => {
      const res = await env.app.inject({ method: "GET", url: `/v1/orders/${orderId}` });
      return res.json().order.status === "FAILED";
    });
    await waitFor(async () => {
      const [jobs] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT status FROM provisioning_jobs WHERE order_id = ?",
        [orderId],
      );
      return jobs[0]?.status === "failed";
    });

    const [rows] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      `SELECT j.status AS j, j.last_error,
              (SELECT COUNT(*) FROM ip_addresses i WHERE i.status = 'free' AND i.region = 'mumbai') AS free_mumbai
       FROM provisioning_jobs j WHERE j.order_id = ?`,
      [orderId],
    );
    expect(rows[0].j).toBe("failed");
    expect(rows[0].last_error).toContain("provisioner timeout");

    const [servers] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM servers WHERE order_id = ?",
      [orderId],
    );
    expect(servers[0].n).toBe(0);
    // 3 seeded mumbai IPs, none leaked as reserved/allocated
    expect(rows[0].free_mumbai).toBe(3);
  });

  it("retries transient failures before giving up", async () => {
    env.provisioner.failCount = 1;
    const orderId = await payForOrder();

    await waitFor(async () => {
      const res = await env.app.inject({ method: "GET", url: `/v1/orders/${orderId}` });
      return res.json().order.status === "ACTIVE";
    });

    const [rows] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT status, attempts FROM provisioning_jobs WHERE order_id = ?",
      [orderId],
    );
    expect(rows[0].status).toBe("completed");
    expect(rows[0].attempts).toBeGreaterThan(1);
  });

  it("never provisions the same order twice even with duplicate payment events", async () => {
    const orderId = await payForOrder();

    await waitFor(async () => {
      const res = await env.app.inject({ method: "GET", url: `/v1/orders/${orderId}` });
      return res.json().order.status === "ACTIVE";
    });

    // simulate a late duplicate webhook capture
    const [orders] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT provisioning_key FROM orders WHERE id = ?",
      [orderId],
    );
    await env.pool.execute(
      "INSERT IGNORE INTO provisioning_jobs (id, order_id, job_type, status) VALUES (UUID(), ?, 'provision_server', 'queued')",
      [orderId],
    );
    await waitFor(async () => {
      const [jobs] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
        "SELECT COUNT(*) AS n FROM provisioning_jobs WHERE order_id = ? AND status = 'completed'",
        [orderId],
      );
      return jobs[0].n === 1;
    });

    const [servers] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM servers WHERE order_id = ?",
      [orderId],
    );
    expect(servers[0].n).toBe(1);
  });
});