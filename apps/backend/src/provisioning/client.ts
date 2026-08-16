import type { Config } from "../config.js";
import { Errors } from "../errors.js";
import type { ProvisionRequestInput } from "@irctcrdp/validation";

export interface ServerActionResult {
  ok: boolean;
  action: string;
}

export interface ProvisionerClient {
  provision(input: ProvisionRequestInput): Promise<{ ok: boolean }>;
  action(action: "reboot" | "reinstall" | "terminate", server: { orderId: string; hostname: string; ipv4: string | null }): Promise<ServerActionResult>;
  ping(): Promise<boolean>;
}

export class HttpProvisionerClient implements ProvisionerClient {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(config: Config) {
    this.baseUrl = config.PROVISIONER_URL;
    this.secret = config.INTERNAL_API_SECRET;
  }

  private async post(path: string, body: unknown, timeoutMs = 15000): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-secret": this.secret,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Provisioner ${path} failed (${res.status}): ${text.slice(0, 200)}`);
      }
      return await res.json();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Provisioner ${path} timed out`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async provision(input: ProvisionRequestInput): Promise<{ ok: boolean }> {
    return (await this.post("/internal/provision", input)) as { ok: boolean };
  }

  async action(
    action: "reboot" | "reinstall" | "terminate",
    server: { orderId: string; hostname: string; ipv4: string | null },
  ): Promise<ServerActionResult> {
    return (await this.post("/internal/actions", { action, server })) as ServerActionResult;
  }

  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export { Errors };