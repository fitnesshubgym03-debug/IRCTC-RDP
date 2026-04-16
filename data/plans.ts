export type Plan = {
  id: string
  name: string
  tagline: string
  vcpu: number
  ramGB: number
  storageGB: number
  bandwidthTB: number
  priceINR: number // monthly
  priceUSD: number // monthly
  popular?: boolean
  features: string[]
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter VPS",
    tagline: "For personal projects and small apps.",
    vcpu: 1,
    ramGB: 2,
    storageGB: 40,
    bandwidthTB: 1,
    priceINR: 499,
    priceUSD: 6,
    features: [
      "1 vCPU (shared)",
      "2 GB DDR4 RAM",
      "40 GB NVMe SSD",
      "1 TB bandwidth",
      "1 Gbps port",
      "Full root access",
      "IPv4 + IPv6",
    ],
  },
  {
    id: "business",
    name: "Business VPS",
    tagline: "Balanced performance for production workloads.",
    vcpu: 2,
    ramGB: 4,
    storageGB: 80,
    bandwidthTB: 2,
    priceINR: 999,
    priceUSD: 12,
    popular: true,
    features: [
      "2 vCPU",
      "4 GB DDR4 RAM",
      "80 GB NVMe SSD",
      "2 TB bandwidth",
      "1 Gbps port",
      "Full root access",
      "Weekly backups",
    ],
  },
  {
    id: "pro",
    name: "Pro VPS",
    tagline: "For growing teams and demanding apps.",
    vcpu: 4,
    ramGB: 8,
    storageGB: 160,
    bandwidthTB: 4,
    priceINR: 1899,
    priceUSD: 23,
    features: [
      "4 vCPU",
      "8 GB DDR4 RAM",
      "160 GB NVMe SSD",
      "4 TB bandwidth",
      "1 Gbps port",
      "Priority support",
      "Snapshots included",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise VPS",
    tagline: "Scale with confidence across regions.",
    vcpu: 8,
    ramGB: 16,
    storageGB: 320,
    bandwidthTB: 6,
    priceINR: 3499,
    priceUSD: 42,
    features: [
      "8 vCPU",
      "16 GB DDR4 RAM",
      "320 GB NVMe SSD",
      "6 TB bandwidth",
      "1 Gbps port",
      "24/7 priority support",
      "Automated snapshots",
    ],
  },
]

export type BillingCycle = "monthly" | "quarterly" | "annual"

export const billingCycleMultiplier: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3 * 0.95, // 5% off
  annual: 12 * 0.83, // ~17% off
}

export const billingCycleLabel: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly (save 5%)",
  annual: "Annual (save 17%)",
}
