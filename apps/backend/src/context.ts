import type { Config } from "./config.js";
import type { Pool } from "./database/pool.js";
import type { RazorpayClient } from "./payments/razorpay.js";
import type { ProvisionerClient } from "./provisioning/client.js";
import type { SessionUser } from "./auth/sessions.js";

export interface Ctx {
  config: Config;
  db: Pool;
  razorpay: RazorpayClient;
  provisioner: ProvisionerClient;
}

declare module "fastify" {
  interface FastifyInstance {
    ctx: Ctx;
  }
  interface FastifyRequest {
    user?: SessionUser;
  }
}

export function clientIp(req: { headers: Record<string, string | string[] | undefined>; ip: string }): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf.length > 0) return cf;
  return req.ip;
}