import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, resetTestDb, signPayload, type TestEnv } from "./helpers.js";

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
});

function capturedEvent(paymentId = "pay_evt_001", orderId = "ord_sim_abcdef12", amount = 99900) {
  return JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: { id: paymentId, order_id: orderId, amount, status: "captured", method: "card" },
      },
    },
  });
}

describe("POST /webhooks/razorpay", () => {
  it("processes a signed payment.captured event", async () => {
    const body = capturedEvent();
    const res = await env.app.inject({
      method: "POST",
      url: "/webhooks/razorpay",
      headers: { "content-type": "application/json", "x-razorpay-signature": signPayload(env.config.RAZORPAY_WEBHOOK_SECRET, body) },
      payload: body,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });

  it("rejects a missing or invalid signature", async () => {
    const body = capturedEvent();
    const noSig = await env.app.inject({
      method: "POST",
      url: "/webhooks/razorpay",
      headers: { "content-type": "application/json" },
      payload: body,
    });
    expect(noSig.statusCode).toBe(401);

    const badSig = await env.app.inject({
      method: "POST",
      url: "/webhooks/razorpay",
      headers: { "content-type": "application/json", "x-razorpay-signature": "invalid" },
      payload: body,
    });
    expect(badSig.statusCode).toBe(401);
  });

  it("dedupes replayed events — no double processing", async () => {
    const body = capturedEvent("pay_evt_dedup");
    const headers = {
      "content-type": "application/json",
      "x-razorpay-signature": signPayload(env.config.RAZORPAY_WEBHOOK_SECRET, body),
    };

    const first = await env.app.inject({ method: "POST", url: "/webhooks/razorpay", headers, payload: body });
    expect(first.json().duplicate).toBeUndefined();

    const replay = await env.app.inject({ method: "POST", url: "/webhooks/razorpay", headers, payload: body });
    expect(replay.statusCode).toBe(200);
    expect(replay.json().duplicate).toBe(true);

    const [events] = await env.pool.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM payment_events WHERE event_id = 'pay_evt_dedup'",
    );
    expect(events[0].n).toBe(1);
  });

  it("tolerates an unknown/irrelevant event type", async () => {
    const body = JSON.stringify({
      event: "payment.authorized",
      payload: { payment: { entity: { id: "pay_evt_auth", order_id: "ord_sim_x", amount: 99900, status: "authorized" } } },
    });
    const res = await env.app.inject({
      method: "POST",
      url: "/webhooks/razorpay",
      headers: { "content-type": "application/json", "x-razorpay-signature": signPayload(env.config.RAZORPAY_WEBHOOK_SECRET, body) },
      payload: body,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });
});