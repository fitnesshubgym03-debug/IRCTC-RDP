import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp, resetTestDb, registerUser, type TestEnv } from "./helpers.js";

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

function cookieOf(res: { headers: Record<string, unknown> }): string {
  const setCookie = String(res.headers["set-cookie"] ?? "");
  return setCookie.split(";")[0];
}

describe("auth", () => {
  it("registers, logs in, reads /me and logs out", async () => {
    const registered = await registerUser(env.app);
    expect(registered.statusCode).toBe(201);
    expect(registered.json().user.email).toBe("buyer@test.com");

    const login = await env.app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "buyer@test.com", password: "Str0ngPass!word" },
    });
    expect(login.statusCode).toBe(200);
    const cookie = cookieOf(login);

    const me = await env.app.inject({ method: "GET", url: "/v1/auth/me", headers: { cookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.name).toBe("Test Buyer");

    const logout = await env.app.inject({ method: "POST", url: "/v1/auth/logout", headers: { cookie } });
    expect(logout.statusCode).toBe(200);

    const after = await env.app.inject({ method: "GET", url: "/v1/auth/me", headers: { cookie } });
    expect(after.statusCode).toBe(401);
  });

  it("rejects a wrong password", async () => {
    await registerUser(env.app);
    const res = await env.app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "buyer@test.com", password: "WrongPassword1" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a duplicate email", async () => {
    await registerUser(env.app);
    const res = await registerUser(env.app);
    expect(res.statusCode).toBe(409);
  });

  it("returns 401 for /me without a session", async () => {
    const res = await env.app.inject({ method: "GET", url: "/v1/auth/me" });
    expect(res.statusCode).toBe(401);
  });
});

describe("order ownership", () => {
  it("blocks cross-customer access to orders", async () => {
    await registerUser(env.app, "alice@test.com");
    const alice = await env.app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "alice@test.com", password: "Str0ngPass!word" },
    });
    const aliceCookie = cookieOf(alice);

    const created = await env.app.inject({
      method: "POST",
      url: "/v1/orders",
      headers: { cookie: aliceCookie },
      payload: { planId: "intel-6c-16gb", region: "mumbai", os: "windows-server-2022", billingCycle: "monthly" },
    });
    expect(created.statusCode).toBe(201);
    const orderId = created.json().order.id;

    await registerUser(env.app, "bob@test.com");
    const bob = await env.app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "bob@test.com", password: "Str0ngPass!word" },
    });
    const bobCookie = cookieOf(bob);

    const blocked = await env.app.inject({
      method: "GET",
      url: `/v1/orders/${orderId}`,
      headers: { cookie: bobCookie },
    });
    expect(blocked.statusCode).toBe(403);

    const owner = await env.app.inject({
      method: "GET",
      url: `/v1/orders/${orderId}`,
      headers: { cookie: aliceCookie },
    });
    expect(owner.statusCode).toBe(200);
    expect(owner.json().order.id).toBe(orderId);
  });

  it("lets an anonymous user see their own guest order", async () => {
    const created = await env.app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { planId: "intel-6c-16gb", region: "mumbai", os: "windows-server-2022", billingCycle: "monthly" },
    });
    const orderId = created.json().order.id;

    const res = await env.app.inject({ method: "GET", url: `/v1/orders/${orderId}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().order.status).toBe("PENDING_PAYMENT");
  });
});