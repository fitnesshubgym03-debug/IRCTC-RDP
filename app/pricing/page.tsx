import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { PlanCard } from "@/components/plans/plan-card"
import { SectionHeader } from "@/components/layout/section-header"
import { CTASection } from "@/components/cta-section"
import { plans } from "@/data/plans"
import { Check, X } from "lucide-react"
import { FAQAccordion } from "@/components/faq-accordion"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for ZWS Cloud VPS plans. Compare features side by side, upgrade anytime.",
}

const comparisonRows: {
  feature: string
  values: (string | boolean)[]
}[] = [
  { feature: "vCPU", values: ["1", "2", "4", "8"] },
  { feature: "RAM", values: ["2 GB", "4 GB", "8 GB", "16 GB"] },
  { feature: "NVMe storage", values: ["40 GB", "80 GB", "160 GB", "320 GB"] },
  { feature: "Bandwidth", values: ["1 TB", "2 TB", "4 TB", "6 TB"] },
  { feature: "Full root access", values: [true, true, true, true] },
  { feature: "DDoS protection", values: [true, true, true, true] },
  { feature: "IPv4 + IPv6", values: [true, true, true, true] },
  { feature: "Automated backups", values: [false, true, true, true] },
  { feature: "Priority support", values: [false, false, true, true] },
  { feature: "24/7 phone support", values: [false, false, false, true] },
]

const pricingFaqs = [
  {
    q: "What currency is pricing shown in?",
    a: "Prices are displayed in INR by default. USD equivalents are available in the configurator and during checkout.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can change plans at any time. We pro-rate the difference and apply it as a credit to your account.",
  },
  {
    q: "Are there setup fees?",
    a: "No. All plans ship with zero setup fees. You pay only for the plan you choose and any optional add-ons.",
  },
  {
    q: "Do you offer volume or annual discounts?",
    a: "Quarterly billing includes approximately 5% savings; annual billing includes approximately 17% savings. Volume pricing is available — contact sales.",
  },
]

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Pricing"
        title="Plans built around real workloads."
        description="No surprise bills, no manufactured urgency. Upgrade, downgrade, or cancel at any time."
      />

      <section className="py-16">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="Compare plans"
            title="Feature-by-feature comparison"
          />
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 text-left font-medium">Feature</th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className="px-5 py-4 text-left font-medium text-foreground"
                    >
                      {p.name.replace(" VPS", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-5 py-3.5 text-muted-foreground">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/60" />
                          )
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-foreground/[0.03]">
                  <td className="px-5 py-4 font-semibold">Starting at</td>
                  {plans.map((p) => (
                    <td
                      key={p.id}
                      className="px-5 py-4 font-semibold text-foreground"
                    >
                      ₹{p.priceINR.toLocaleString()}/mo
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader
            eyebrow="Pricing FAQ"
            title="Common questions about billing"
          />
          <FAQAccordion items={pricingFaqs} />
        </Container>
      </section>

      <CTASection />
    </SiteShell>
  )
}
