/**
 * @irctcrdp/validation
 *
 * Zod schemas shared between the backend API and the provisioner.
 * The frontend must never treat these as security boundaries —
 * the backend re-validates every input it receives.
 */

import { z } from "zod";
import { BILLING_CYCLES, OS_IDS, PLAN_IDS, REGION_IDS } from "@irctcrdp/contracts";

export const createOrderSchema = z.object({
  planId: z.enum(PLAN_IDS),
  region: z.enum(REGION_IDS),
  os: z.enum(OS_IDS),
  billingCycle: z.enum(BILLING_CYCLES),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const registerSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const paymentVerificationSchema = z.object({
  orderId: z.string().min(8).max(64),
  razorpayOrderId: z.string().min(8).max(64),
  razorpayPaymentId: z.string().min(8).max(64),
  razorpaySignature: z.string().min(8).max(256),
});
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;

export const idParamSchema = z.object({ id: z.string().min(8).max(64) });

export const internalJobResultSchema = z.object({
  jobId: z.string().min(8).max(64),
  status: z.enum(["completed", "failed", "retrying"]),
  server: z
    .object({
      hostname: z.string().min(1).max(120),
      ipv4: z.string().max(45).nullable(),
      rdpPort: z.number().int().min(1).max(65535).nullable(),
      proxmoxVmId: z.number().int().positive().nullable(),
      node: z.string().max(80).nullable(),
    })
    .optional(),
  error: z.string().max(500).optional(),
});
export type InternalJobResultInput = z.infer<typeof internalJobResultSchema>;

export const provisionRequestSchema = z.object({
  jobId: z.string().min(8).max(64),
  orderId: z.string().min(8).max(64),
  planId: z.enum(PLAN_IDS),
  region: z.enum(REGION_IDS),
  os: z.enum(OS_IDS),
  hostname: z.string().min(1).max(120),
  cpuCores: z.number().int().min(1).max(64),
  ramMB: z.number().int().min(512).max(524288),
  diskGB: z.number().int().min(10).max(4096),
  ipv4: z.string().max(45),
  gateway: z.string().max(45),
  prefixLen: z.number().int().min(8).max(32),
  dnsPrimary: z.string().max(45),
  dnsSecondary: z.string().max(45),
});
export type ProvisionRequestInput = z.infer<typeof provisionRequestSchema>;

export const internalActionSchema = z.object({
  action: z.enum(["reboot", "reinstall", "terminate"]),
  server: z.object({
    orderId: z.string().min(8).max(64),
    hostname: z.string().min(1).max(120),
    ipv4: z.string().max(45).nullable(),
  }),
  provision: provisionRequestSchema.optional(),
});
export type InternalActionInput = z.infer<typeof internalActionSchema>;