import type { BillingCycle, PlanFamily, PlanId, PublicPlan } from "@irctcrdp/contracts";
import { PLAN_FAMILY_PLATFORM } from "@irctcrdp/contracts";

export interface CatalogPlan extends PublicPlan {
  storageGB: number;
}

const SHARED_FEATURES = [
  "NVMe SSD",
  "Full root/administrator access",
  "IPv4 + IPv6 where available",
  "High-speed network",
];

const FEATURES: Record<PlanId, string[]> = {
  "intel-4c-8gb": ["4 CPU cores", "8 GB RAM", ...SHARED_FEATURES],
  "intel-6c-16gb": ["6 CPU cores", "16 GB RAM", ...SHARED_FEATURES],
  "intel-6c-24gb": ["6 CPU cores", "24 GB RAM", ...SHARED_FEATURES],
  "intel-8c-32gb": ["8 CPU cores", "32 GB RAM", ...SHARED_FEATURES],
  "ryzen-4c-8gb": ["AMD Ryzen 9 9950X3D", "4 CPU cores", "8 GB RAM", ...SHARED_FEATURES],
  "ryzen-6c-16gb": ["AMD Ryzen 9 9950X3D", "6 CPU cores", "16 GB RAM", ...SHARED_FEATURES],
  "ryzen-6c-24gb": ["AMD Ryzen 9 9950X3D", "6 CPU cores", "24 GB RAM", ...SHARED_FEATURES],
  "ryzen-8c-32gb": ["AMD Ryzen 9 9950X3D", "8 CPU cores", "32 GB RAM", ...SHARED_FEATURES],
};

const STORAGE_GB: Record<PlanId, number> = {
  "intel-4c-8gb": 40,
  "intel-6c-16gb": 80,
  "intel-6c-24gb": 120,
  "intel-8c-32gb": 160,
  "ryzen-4c-8gb": 40,
  "ryzen-6c-16gb": 80,
  "ryzen-6c-24gb": 120,
  "ryzen-8c-32gb": 160,
};

function plan(
  id: PlanId,
  family: PlanFamily,
  name: string,
  tagline: string,
  cpuCores: number,
  ramGB: number,
  priceINR: number,
  priceUSD: number,
  flags: { popular?: boolean; bestValue?: boolean } = {},
): CatalogPlan {
  return {
    id,
    family,
    platform: PLAN_FAMILY_PLATFORM[family],
    name,
    tagline,
    cpuCores,
    ramGB,
    storageGB: STORAGE_GB[id],
    priceINR,
    priceUSD,
    popular: flags.popular,
    bestValue: flags.bestValue,
    features: FEATURES[id],
  };
}

/**
 * Authoritative product catalog. Owned by the backend.
 * The frontend only ever receives this via GET /v1/products and must never
 * be authoritative for money — order amounts are computed here, server-side.
 */
export const CATALOG: Record<PlanId, CatalogPlan> = {
  "intel-4c-8gb": plan("intel-4c-8gb", "intel", "4C / 8 GB", "Reliable Intel performance for everyday workloads.", 4, 8, 799, 10),
  "intel-6c-16gb": plan("intel-6c-16gb", "intel", "6C / 16 GB", "Balanced capacity for demanding remote sessions.", 6, 16, 999, 12, { popular: true, bestValue: true }),
  "intel-6c-24gb": plan("intel-6c-24gb", "intel", "6C / 24 GB", "More memory for heavier multitasking.", 6, 24, 1499, 18),
  "intel-8c-32gb": plan("intel-8c-32gb", "intel", "8C / 32 GB", "Maximum Intel capacity for large workloads.", 8, 32, 1999, 24),
  "ryzen-4c-8gb": plan("ryzen-4c-8gb", "amd", "4C / 8 GB", "Premium single-core performance in a compact plan.", 4, 8, 1299, 16),
  "ryzen-6c-16gb": plan("ryzen-6c-16gb", "amd", "6C / 16 GB", "Premium balance for high-intensity workflows.", 6, 16, 1999, 24, { popular: true }),
  "ryzen-6c-24gb": plan("ryzen-6c-24gb", "amd", "6C / 24 GB", "Extreme single-core performance with extra memory.", 6, 24, 2799, 34),
  "ryzen-8c-32gb": plan("ryzen-8c-32gb", "amd", "8C / 32 GB", "The premium IRCTC RDP performance tier.", 8, 32, 3499, 42),
};

export const PLAN_LIST: CatalogPlan[] = Object.values(CATALOG);

export function getPlan(id: string): CatalogPlan | null {
  return CATALOG[id as PlanId] ?? null;
}

/** Discount multipliers mirror the published billing-cycle discounts. */
const CYCLE_MULTIPLIER: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3 * 0.95,
  annual: 12 * 0.83,
};

/** Total INR charged for the full billing cycle (backend-authoritative). */
export function priceForCycle(plan: CatalogPlan, cycle: BillingCycle): number {
  return Math.round(plan.priceINR * CYCLE_MULTIPLIER[cycle]);
}