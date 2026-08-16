import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createTestApp, type TestEnv } from "./helpers.js";
import { getPlan } from "../src/products/catalog.js";

let env: TestEnv;

beforeAll(async () => {
  env = await createTestApp();
});

afterAll(async () => {
  env.worker.stop();
  await env.app.close();
  await env.pool.end();
});

const EXPECTED_PLAN_IDS = [
  "intel-4c-8gb",
  "intel-6c-16gb",
  "intel-6c-24gb",
  "intel-8c-32gb",
  "ryzen-4c-8gb",
  "ryzen-6c-16gb",
  "ryzen-6c-24gb",
  "ryzen-8c-32gb",
];

const CYCLE_MULTIPLIERS: Record<string, number> = { monthly: 1, quarterly: 3 * 0.95, annual: 12 * 0.83 };

describe("GET /v1/products", () => {
  it("serves exactly the 8 authoritative plans", async () => {
    const res = await env.app.inject({ method: "GET", url: "/v1/products" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    const ids = body.products.map((p: { id: string }) => p.id);
    expect(ids).toEqual(EXPECTED_PLAN_IDS);
  });

  it("prices match the backend catalog for every plan", async () => {
    const res = await env.app.inject({ method: "GET", url: "/v1/products" });
    for (const plan of res.json().products) {
      const catalog = getPlan(plan.id);
      expect(catalog).toBeDefined();
      expect(plan.priceINR).toBe(catalog!.priceINR);
      expect(plan.cpuCores).toBe(catalog!.cpuCores);
      expect(plan.ramGB).toBe(catalog!.ramGB);
      expect(plan.platform).toBe(catalog!.platform);
    }
  });

  it("order amounts are computed server-side and cannot be tampered", async () => {
    for (const planId of EXPECTED_PLAN_IDS) {
      for (const cycle of ["monthly", "quarterly", "annual"] as const) {
        const res = await env.app.inject({
          method: "POST",
          url: "/v1/orders",
          payload: { planId, region: "mumbai", os: "windows-server-2022", billingCycle: cycle },
        });
        expect(res.statusCode).toBe(201);
        const expected = Math.round(getPlan(planId)!.priceINR * CYCLE_MULTIPLIERS[cycle]);
        expect(res.json().order.amountINR).toBe(expected);
        expect(res.json().checkout.amountINR).toBe(expected);
      }
    }
  });

  it("rejects an invalid plan id", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { planId: "gpu-1x", region: "mumbai", os: "windows-server-2022", billingCycle: "monthly" },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().code).toBe("INVALID_ORDER_INPUT");
  });

  it("rejects a missing billing cycle", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { planId: "intel-4c-8gb", region: "mumbai", os: "ubuntu-24-04" },
    });
    expect(res.statusCode).toBe(422);
  });
});