import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import { loadConfig, type Config } from "./config.js";
import { createPool, type Pool } from "./database/pool.js";
import type { Ctx } from "./context.js";
import type { RazorpayClient } from "./payments/razorpay.js";
import { RazorpayClientImpl } from "./payments/razorpay.js";
import type { ProvisionerClient } from "./provisioning/client.js";
import { HttpProvisionerClient } from "./provisioning/client.js";
import { ApiError } from "./errors.js";
import { authRoutes } from "./auth/routes.js";
import { ordersRoutes } from "./orders/service.js";
import { webhookRoutes } from "./webhooks/razorpay.js";
import { serverRoutes } from "./servers/service.js";
import { internalRoutes } from "./internal/routes.js";
import { adminRoutes } from "./admin/routes.js";
import { healthRoutes } from "./health/routes.js";
import { productsRoutes } from "./products/routes.js";
import { contactRoutes } from "./routes/contact.js";

export interface AppOptions {
  config?: Config;
  pool?: Pool;
  razorpayClient?: RazorpayClient;
  provisionerClient?: ProvisionerClient;
  logger?: boolean | object;
}

export async function buildApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const config = opts.config ?? loadConfig();
  const pool = opts.pool ?? createPool(config);
  const razorpay = opts.razorpayClient ?? new RazorpayClientImpl(config);
  const provisioner = opts.provisionerClient ?? new HttpProvisionerClient(config);

  const app = Fastify({
    logger: opts.logger ?? true,
    trustProxy: config.TRUST_PROXY,
    bodyLimit: 64 * 1024,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "requestId",
  });

  const ctx: Ctx = { config, db: pool, razorpay, provisioner };
  app.decorate("ctx", ctx);

  await app.register(cookie);
  await app.register(cors, {
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow: string | boolean | RegExp | Array<string | boolean | RegExp>) => void,
    ) => {
      if (!origin) return cb(null, true); // non-browser clients (provisioner, curl)
      cb(null, config.CORS_ORIGINS.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  });
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: "1 minute",
    keyGenerator: (req) => String((req.headers["cf-connecting-ip"] as string) ?? req.ip),
  });
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ApiError) {
      return reply.code(err.statusCode).send({ error: err.message, code: err.code });
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      typeof err.statusCode === "number" &&
      err.statusCode >= 400 &&
      err.statusCode < 500
    ) {
      return reply.code(err.statusCode).send({ error: (err as { message?: string }).message ?? "Bad request" });
    }
    req.log.error({ err }, "unhandled error");
    return reply.code(500).send({ error: "Internal server error" });
  });

  await app.register(healthRoutes);
  await app.register(productsRoutes);
  await app.register(contactRoutes);
  await app.register(authRoutes);
  await app.register(ordersRoutes);
  await app.register(serverRoutes);
  await app.register(webhookRoutes);
  await app.register(internalRoutes);
  await app.register(adminRoutes);

  return app;
}