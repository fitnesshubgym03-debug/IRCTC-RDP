import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MYSQL_URL: z.string().min(1, "MYSQL_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 chars"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(30 * 24 * 3600),
  INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 chars"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  /** simulated: deterministic local stub for staging/e2e; test: Razorpay test mode; live: production. */
  RAZORPAY_MODE: z.enum(["simulated", "test", "live"]).default("test"),
  PROVISIONER_URL: z.string().url().default("http://127.0.0.1:4001"),
  CORS_ORIGINS: z
    .string()
    .default("https://irctcrdp.com,https://www.irctcrdp.com")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  COOKIE_DOMAIN: z.string().default(""),
  TRUST_PROXY: z
    .string()
    .default("true")
    .transform((v) => v === "true" || v === "1"),
  DB_POOL_SIZE: z.coerce.number().int().positive().default(10),
});

export type Config = z.infer<typeof envSchema> & {
  razorpayConfigured: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return {
    ...parsed.data,
    razorpayConfigured: Boolean(parsed.data.RAZORPAY_KEY_ID && parsed.data.RAZORPAY_KEY_SECRET),
  };
}