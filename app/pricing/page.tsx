import type { Metadata } from "next"
import { Check, Cpu } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { PlanCard } from "@/components/plans/plan-card"
import { CpuLogo } from "@/components/plans/cpu-logo"
import { SectionHeader } from "@/components/layout/section-header"
import { CTASection } from "@/components/cta-section"
import { FAQAccordion } from "@/components/faq-accordion"
import { plans } from "@/data/plans"

export const metadata: Metadata = {
  title: "RDP Pricing",
  description:
    "Choose high-performance Intel infrastructure or unlock premium performance with AMD Ryzen 9 9950X3D.",
}

const pricingFaqs = [
  {
    q: "What currency is pricing shown in?",
    a: "Prices are displayed in INR per month. The listed amount is the monthly plan price.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. Contact support to change the CPU and RAM configuration attached to your RDP workspace.",
  },
  {
    q: "What is included with every plan?",
    a: "Every plan includes NVMe SSD storage, full root/administrator access, IPv4 + IPv6 where available, and a high-speed network.",
  },
  {
    q: "What is the difference between Intel and Ryzen?",
    a: "Intel plans provide dependable performance at an accessible price. AMD Ryzen 9 9950X3D plans are the premium option for demanding workloads and extreme single-core performance.",
  },
]

const intelPlans = plans.filter((plan) => plan.platform === "Intel")
const ryzenPlans = plans.filter((plan) => plan.platform === "AMD Ryzen 9 9950X3D")

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="RDP pricing"
        title="Power built around your workload."
        description="Choose high-performance Intel infrastructure or unlock premium performance with AMD Ryzen 9 9950X3D."
      />

      <section className="py-12 sm:py-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <CpuLogo brand="Intel" priority className="h-12 self-start sm:h-14" />
            <SectionHeader
              eyebrow="Intel platform"
              title="INTEL XEON"
              description="Reliable performance for fast, focused remote workflows."
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {intelPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <Container className="flex flex-col gap-10">
          <div className="glass-strong relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="pointer-events-none absolute right-8 top-8 size-32 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                <Cpu className="size-4" /> Premium CPU platform
              </div>
              <CpuLogo brand="Ryzen" className="h-12 self-start sm:h-14" />
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                AMD Ryzen 9 9950X3D
              </h2>
              <p className="max-w-2xl text-pretty leading-7 text-muted-foreground">
                Extreme single-core performance for demanding workloads.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ryzenPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="Compare configurations" title="At a glance" />
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 text-left font-medium">Configuration</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-5 py-4 text-left font-medium text-foreground">
                      {plan.platform === "Intel" ? "Intel" : "Ryzen 9 9950X3D"}<br />{plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "CPU cores", values: plans.map((p) => `${p.cpuCores} Cores`) },
                  { feature: "RAM", values: plans.map((p) => `${p.ramGB} GB`) },
                  { feature: "Storage", values: plans.map(() => "NVMe SSD") },
                  { feature: "Network", values: plans.map(() => "High Speed") },
                  { feature: "Root/Admin access", values: plans.map(() => true) },
                  { feature: "IPv4 + IPv6", values: plans.map(() => true) },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.feature}-${index}`} className="px-5 py-3.5 text-muted-foreground">
                        {typeof value === "boolean" ? <Check className="size-4 text-accent" /> : value}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-foreground/[0.03]">
                  <td className="px-5 py-4 font-semibold">Monthly price</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-5 py-4 font-semibold text-foreground">
                      ₹{plan.priceINR.toLocaleString("en-IN")}/mo
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader eyebrow="Pricing FAQ" title="Common questions about plans" />
          <FAQAccordion items={pricingFaqs} />
        </Container>
      </section>

      <CTASection />
    </SiteShell>
  )
}
