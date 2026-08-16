export type Plan = {
  id: string
  platform: "Intel" | "AMD Ryzen 9 9950X3D"
  name: string
  tagline: string
  cpuCores: number
  ramGB: number
  priceINR: number
  priceUSD: number
  popular?: boolean
  bestValue?: boolean
  features: string[]
}

const sharedFeatures = [
  "NVMe SSD",
  "Full root/administrator access",
  "IPv4 + IPv6 where available",
  "High-speed network",
]

export const plans: Plan[] = [
  {
    id: "intel-4c-8gb",
    platform: "Intel",
    name: "4C / 8 GB",
    tagline: "Reliable Intel performance for everyday workloads.",
    cpuCores: 4,
    ramGB: 8,
    priceINR: 799,
    priceUSD: 10,
    features: ["4 CPU cores", "8 GB RAM", ...sharedFeatures],
  },
  {
    id: "intel-6c-16gb",
    platform: "Intel",
    name: "6C / 16 GB",
    tagline: "Balanced capacity for demanding remote sessions.",
    cpuCores: 6,
    ramGB: 16,
    priceINR: 999,
    priceUSD: 12,
    popular: true,
    bestValue: true,
    features: ["6 CPU cores", "16 GB RAM", ...sharedFeatures],
  },
  {
    id: "intel-6c-24gb",
    platform: "Intel",
    name: "6C / 24 GB",
    tagline: "More memory for heavier multitasking.",
    cpuCores: 6,
    ramGB: 24,
    priceINR: 1499,
    priceUSD: 18,
    features: ["6 CPU cores", "24 GB RAM", ...sharedFeatures],
  },
  {
    id: "intel-8c-32gb",
    platform: "Intel",
    name: "8C / 32 GB",
    tagline: "Maximum Intel capacity for large workloads.",
    cpuCores: 8,
    ramGB: 32,
    priceINR: 1999,
    priceUSD: 24,
    features: ["8 CPU cores", "32 GB RAM", ...sharedFeatures],
  },
  {
    id: "ryzen-4c-8gb",
    platform: "AMD Ryzen 9 9950X3D",
    name: "4C / 8 GB",
    tagline: "Premium single-core performance in a compact plan.",
    cpuCores: 4,
    ramGB: 8,
    priceINR: 1299,
    priceUSD: 16,
    features: ["AMD Ryzen 9 9950X3D", "4 CPU cores", "8 GB RAM", ...sharedFeatures],
  },
  {
    id: "ryzen-6c-16gb",
    platform: "AMD Ryzen 9 9950X3D",
    name: "6C / 16 GB",
    tagline: "Premium balance for high-intensity workflows.",
    cpuCores: 6,
    ramGB: 16,
    priceINR: 1999,
    priceUSD: 24,
    popular: true,
    features: ["AMD Ryzen 9 9950X3D", "6 CPU cores", "16 GB RAM", ...sharedFeatures],
  },
  {
    id: "ryzen-6c-24gb",
    platform: "AMD Ryzen 9 9950X3D",
    name: "6C / 24 GB",
    tagline: "Extreme single-core performance with extra memory.",
    cpuCores: 6,
    ramGB: 24,
    priceINR: 2799,
    priceUSD: 34,
    features: ["AMD Ryzen 9 9950X3D", "6 CPU cores", "24 GB RAM", ...sharedFeatures],
  },
  {
    id: "ryzen-8c-32gb",
    platform: "AMD Ryzen 9 9950X3D",
    name: "8C / 32 GB",
    tagline: "The premium IRCTC RDP performance tier.",
    cpuCores: 8,
    ramGB: 32,
    priceINR: 3499,
    priceUSD: 42,
    features: ["AMD Ryzen 9 9950X3D", "8 CPU cores", "32 GB RAM", ...sharedFeatures],
  },
]

export type BillingCycle = "monthly" | "quarterly" | "annual"

export const billingCycleMultiplier: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3 * 0.95,
  annual: 12 * 0.83,
}

export const billingCycleLabel: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly (save 5%)",
  annual: "Annual (save 17%)",
}

export const billingCycleMonths: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
}

export const deployRegions = [
  "Mumbai (BOM)",
  "Delhi (DEL)",
  "Bengaluru (BLR)",
  "Hyderabad (HYD)",
] as const

export const osImages = [
  "Windows Server 2022",
  "Windows Server 2019",
  "Windows 11 Pro",
  "Ubuntu 24.04 LTS",
  "Debian 12",
] as const

export function getPlanById(id: string | null | undefined): Plan | undefined {
  if (!id) return undefined
  return plans.find((plan) => plan.id === id)
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "quarterly" || value === "annual"
}

/** Total INR charged for the full billing cycle, discounts applied and rounded. */
export function priceForCycle(plan: Plan, cycle: BillingCycle): number {
  return Math.round(plan.priceINR * billingCycleMultiplier[cycle])
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`
}
