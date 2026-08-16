import { describe, expect, it } from "vitest";
import { buildProvisionerApp } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { buildTemplates } from "../src/templates.js";

const baseEnv = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "4001",
  PROXMOX_MODE: "simulated",
  INTERNAL_API_SECRET: "test-internal-secret-0123456789abcdef0123456789abcdef",
  BACKEND_URL: "http://127.0.0.1:4000",
  HEALTH_CHECK_TIMEOUT_MS: "5000",
} as const;

describe("provisioner", () => {
  it("health is reachable without a secret", async () => {
    const app = await buildProvisionerApp(loadConfig({ ...baseEnv, NODE_ENV: "test" }));
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().mode).toBe("simulated");
    await app.close();
  });

  it("rejects provisioning without the internal secret", async () => {
    const app = await buildProvisionerApp(loadConfig({ ...baseEnv, NODE_ENV: "test" }));
    const res = await app.inject({
      method: "POST",
      url: "/internal/provision",
      payload: { jobId: "j1", orderId: "o1", hostname: "h1", os: "ubuntu-24-04" },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("rejects an unsupported OS template", async () => {
    const app = await buildProvisionerApp(loadConfig({ ...baseEnv, NODE_ENV: "test" }));
    const res = await app.inject({
      method: "POST",
      url: "/internal/provision",
      headers: { "x-internal-secret": baseEnv.INTERNAL_API_SECRET },
      payload: {
        jobId: "j1",
        orderId: "o1",
        hostname: "h1",
        os: "windows-95",
        cpuCores: 4,
        ramMB: 8192,
        diskGB: 100,
        ipv4: "10.10.0.5",
        gateway: "10.10.0.1",
        prefixLen: 24,
        dnsPrimary: "1.1.1.1",
        dnsSecondary: "8.8.8.8",
      },
    });
    expect(res.statusCode).toBe(422);
    await app.close();
  });

  it("builds a template for every supported OS id", () => {
    const config = loadConfig({ ...baseEnv, NODE_ENV: "test" });
    const templates = buildTemplates(config);
    const osIds = [
      "windows-server-2025",
      "windows-server-2022",
      "windows-server-2019",
      "windows-11-pro",
      "ubuntu-24-04",
      "debian-12",
    ];
    for (const id of osIds) {
      expect(templates[id]).toBeDefined();
    }
    expect(templates["ubuntu-24-04"].rdpPort).toBe(22);
    expect(templates["windows-server-2022"].rdpPort).toBe(3389);
  });
});