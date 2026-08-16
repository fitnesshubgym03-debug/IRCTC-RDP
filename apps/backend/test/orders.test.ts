import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, resetTestDb, paymentSignature, makePaymentId, type TestEnv } from "./helpers.js";

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
  env.razorpay.fetchPaymentOverride = null;
});

async function createOrder(payload: Record<string, unknown> = {}) {
  return env.app.inject({
    method: "POST",
    url: "/v1/orders",
    payload: {
      planId: "intel-6c-16gb",
      region: "mumbai",
      os: "windows-server-2022",
      billingCycle: "monthly",
      ...payload,
    },
  });
}

describe("order payment verification", () => {
  it("marks an order paid with a valid signature and matching amount", async () => {
    const created = await createOrder();
    expect(created.statusCode).toBe(201);
    const { order, checkout } = created.json();

    const paymentId = makePaymentId(checkout.amountINR * 100);
    const res = await env.app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/payment`,
      payload: {
        orderId: order.id,
        razorpayOrderId: checkout.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: paymentSignature(checkout.razorpayOrderId, paymentId),
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().order.status).toBe("PAID");
    expect(res.json().alreadyProcessed).toBe(false);
  });

  it("rejects a forged signature", async () => {
    const { order, checkout } = (await createOrder()).json();
    const paymentId = makePaymentId(checkout.amountINR * 100);
    const res = await env.app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/payment`,
      payload: {
        orderId: order.id,
        razorpayOrderId: checkout.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "deadbeefdeadbeefdeadbeefdeadbeef",
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("BAD_SIGNATURE");
  });

  it("rejects a payment amount that differs from the server-side amount", async () => {
    const { order, checkout } = (await createOrder()).json();
    env.razorpay.fetchPaymentOverride = async () => ({
      amount: checkout.amountINR * 100 - 100, currency: "INR",
      status: "captured",
    });
    const paymentId = makePaymentId(checkout.amountINR * 100);
    const res = await env.app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/payment`,
      payload: {
        orderId: order.id,
        razorpayOrderId: checkout.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: paymentSignature(checkout.razorpayOrderId, paymentId),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("AMOUNT_MISMATCH");
  });

  it("rejects a payment that was not captured", async () => {
    const { order, checkout } = (await createOrder()).json();
    env.razorpay.fetchPaymentOverride = async () => ({
      amount: checkout.amountINR * 100, currency: "INR",
      status: "authorized",
    });
    const paymentId = makePaymentId(checkout.amountINR * 100);
    const res = await env.app.inject({
      method: "POST",
      url: `/v1/orders/${order.id}/payment`,
      payload: {
        orderId: order.id,
        razorpayOrderId: checkout.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: paymentSignature(checkout.razorpayOrderId, paymentId),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("NOT_CAPTURED");
  });

  it("is idempotent — a second verification does not double-process", async () => {
    const { order, checkout } = (await createOrder()).json();
    const paymentId = makePaymentId(checkout.amountINR * 100);
    const payload = {
      orderId: order.id,
      razorpayOrderId: checkout.razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: paymentSignature(checkout.razorpayOrderId, paymentId),
    };

    const first = await env.app.inject({ method: "POST", url: `/v1/orders/${order.id}/payment`, payload });
    expect(first.json().ok).toBe(true);

    const second = await env.app.inject({ method: "POST", url: `/v1/orders/${order.id}/payment`, payload });
    expect(second.statusCode).toBe(200);
    expect(second.json().alreadyProcessed).toBe(true);

    const [jobs] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM provisioning_jobs WHERE order_id = ?",
      [order.id],
    );
    expect(jobs[0].n).toBe(1);
  });

  it("returns 404 for an unknown order", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/v1/orders/does-not-exist/payment",
      payload: {
        orderId: "does-not-exist",
        razorpayOrderId: "ord_sim_nonexistent",
        razorpayPaymentId: "pay_sim_99900",
        razorpaySignature: "s".repeat(32),
      },
    });
    expect(res.statusCode).toBe(404);
  });
});