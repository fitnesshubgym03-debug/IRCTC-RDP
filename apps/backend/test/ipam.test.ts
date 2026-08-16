import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, resetTestDb, type TestEnv } from "./helpers.js";
import { reserveIp, allocateIp, releaseIp } from "../src/ipam/service.js";
import { Errors } from "../src/errors.js";

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

describe("IPAM", () => {
  it("allocates distinct IPs under concurrency", async () => {
    const results = await Promise.all([
      reserveIp(env.pool, "mumbai"),
      reserveIp(env.pool, "mumbai"),
      reserveIp(env.pool, "mumbai"),
    ]);
    const ips = results.map((r) => r.ipv4);
    expect(new Set(ips).size).toBe(3);
    expect(ips.every((ip) => ip.startsWith("10.10.0."))).toBe(true);
  });

  it("fails cleanly when the pool is exhausted", async () => {
    await reserveIp(env.pool, "delhi");
    await reserveIp(env.pool, "delhi");
    await expect(reserveIp(env.pool, "delhi")).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
    });
  });

  it("releases an IP back to the pool for reuse", async () => {
    const first = await reserveIp(env.pool, "bangalore");
    await allocateIp(env.pool, first.id, "server-1");
    await releaseIp(env.pool, first.id);

    const again = await reserveIp(env.pool, "bangalore");
    expect(again.ipv4).toBe(first.ipv4);
  });

  it("does not double-allocate a specific address", async () => {
    const first = await reserveIp(env.pool, "mumbai");
    await allocateIp(env.pool, first.id, "server-1");
    const second = await reserveIp(env.pool, "mumbai");
    expect(second.ipv4).not.toBe(first.ipv4);
  });
});