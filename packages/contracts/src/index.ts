/**
 * @irctcrdp/contracts
 *
 * Safe, shared type definitions used by the frontend, backend and provisioner.
 * This package MUST NEVER contain secrets, database code, or business logic
 * that is authoritative for money (prices are owned by the backend catalog).
 */

export const PLAN_IDS = [
  "intel-4c-8gb",
  "intel-6c-16gb",
  "intel-6c-24gb",
  "intel-8c-32gb",
  "ryzen-4c-8gb",
  "ryzen-6c-16gb",
  "ryzen-6c-24gb",
  "ryzen-8c-32gb",
] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const REGION_IDS = ["mumbai", "delhi", "bangalore", "hyderabad"] as const;
export type RegionId = (typeof REGION_IDS)[number];

export const OS_IDS = [
  "windows-server-2025",
  "windows-server-2022",
  "windows-server-2019",
  "windows-11-pro",
  "ubuntu-24-04",
  "debian-12",
] as const;
export type OperatingSystemId = (typeof OS_IDS)[number];

export const BILLING_CYCLES = ["monthly", "quarterly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const ORDER_STATUSES = [
  "CREATED",
  "PENDING_PAYMENT",
  "PAID",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
  "SUSPENDED",
  "CANCELLED",
  "TERMINATED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "CREATED",
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SERVER_STATUSES = [
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "TERMINATED",
  "FAILED",
  "REINSTALLING",
  "REBOOTING",
] as const;
export type ServerStatus = (typeof SERVER_STATUSES)[number];

export const JOB_STATUSES = ["queued", "processing", "completed", "failed", "retrying"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PLAN_FAMILIES = ["intel", "amd"] as const;
export type PlanFamily = (typeof PLAN_FAMILIES)[number];

export const PLAN_FAMILY_PLATFORM: Record<PlanFamily, string> = {
  intel: "Intel Xeon",
  amd: "AMD Ryzen 9 9950X3D",
};

export const REGION_LABELS: Record<RegionId, string> = {
  mumbai: "Mumbai (BOM)",
  delhi: "Delhi (DEL)",
  bangalore: "Bengaluru (BLR)",
  hyderabad: "Hyderabad (HYD)",
};

export const OS_LABELS: Record<OperatingSystemId, string> = {
  "windows-server-2025": "Windows Server 2025",
  "windows-server-2022": "Windows Server 2022",
  "windows-server-2019": "Windows Server 2019",
  "windows-11-pro": "Windows 11 Pro",
  "ubuntu-24-04": "Ubuntu 24.04 LTS",
  "debian-12": "Debian 12",
};

export interface PublicPlan {
  id: PlanId;
  family: PlanFamily;
  platform: string;
  name: string;
  tagline: string;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  priceINR: number;
  priceUSD: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
}

export interface PublicLocation {
  id: RegionId;
  label: string;
  code: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface PublicOrder {
  id: string;
  planId: PlanId;
  region: RegionId;
  os: OperatingSystemId;
  billingCycle: BillingCycle;
  amountINR: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicServer {
  id: string;
  orderId: string;
  status: ServerStatus;
  hostname: string;
  ipv4: string | null;
  os: OperatingSystemId;
  cpuCores: number;
  ramGB: number;
  region: RegionId;
  rdpPort: number | null;
  createdAt: string;
}

export interface CheckoutPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountINR: number;
  currency: "INR";
}