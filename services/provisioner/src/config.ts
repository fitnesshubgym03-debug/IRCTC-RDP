import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4001),
  INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must match the backend"),
  BACKEND_URL: z.string().url().default("http://127.0.0.1:4000"),
  PROXMOX_MODE: z.enum(["simulated", "real"]).default("simulated"),
  PROXMOX_API_URL: z.string().default("https://pve.example.invalid:8006/api2/json"),
  PROXMOX_AUTH_MODE: z.enum(["password", "token"]).default("password"),
  PROXMOX_USER: z.string().default("root@pam"),
  PROXMOX_PASSWORD: z.string().default(""),
  PROXMOX_TOKEN_ID: z.string().default(""),
  PROXMOX_TOKEN_SECRET: z.string().default(""),
  PROXMOX_NODE: z.string().default("pve1"),
  PROXMOX_STORAGE: z.string().default("local-lvm"),
  PROXMOX_BRIDGE: z.string().default("vmbr0"),
  PROXMOX_POOL: z.string().default(""),
  PROXMOX_VERIFY_TLS: z
    .string()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
  PROXMOX_TEMPLATE_WINDOWS_SERVER_2025: z.string().default("windows-server-2025"),
  PROXMOX_TEMPLATE_WINDOWS_SERVER_2022: z.string().default("windows-server-2022"),
  PROXMOX_TEMPLATE_WINDOWS_SERVER_2019: z.string().default("windows-server-2019"),
  PROXMOX_TEMPLATE_WINDOWS_11_PRO: z.string().default("windows-11-pro"),
  PROXMOX_TEMPLATE_UBUNTU_24_04: z.string().default("ubuntu-2404"),
  PROXMOX_TEMPLATE_DEBIAN_12: z.string().default("debian-12"),
  HEALTH_CHECK_TIMEOUT_MS: z.coerce.number().int().default(90_000),
});

export type ProvisionerConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ProvisionerConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid provisioner environment: ${issues}`);
  }
  return parsed.data;
}