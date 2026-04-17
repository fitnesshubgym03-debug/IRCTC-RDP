import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { CTASection } from "@/components/cta-section"

export const metadata: Metadata = {
  title: "About",
  description:
    "ZWS Cloud is building honest, operations-grade cloud infrastructure.",
}

const values = [
  { k: "Clarity", v: "Clear pricing, clear behavior, clear support paths." },
  { k: "Craft", v: "We build a small set of things and make them excellent." },
  { k: "Consistency", v: "Predictable performance is a feature, not a perk." },
  { k: "Customer first", v: "Engineers answer support. We treat every ticket seriously." },
]

const stats = [
  { k: "Regions", v: "6" },
  { k: "Uptime target", v: "99.99%" },
  { k: "Provisioning", v: "< 60s" },
  { k: "Median ticket response", v: "< 15m" },
]

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="About"
        title="We&apos;re building the hosting company we&apos;d want to use."
        description="ZWS Cloud is a focused infrastructure team. We prioritize stability, transparent pricing, and calm support."
      />

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeader
            eyebrow="Our story"
            title="A hosting company built by operators"
          />
          <div className="flex flex-col gap-5 text-pretty text-base leading-relaxed text-muted-foreground">
            <p>
              ZWS Cloud started with a simple observation: most hosting
              companies optimize for marketing, not operations. We wanted an
              infrastructure provider that felt like a well-run platform team.
              So we built one.
            </p>
            <p>
              Today we operate across multiple regions with a focused set of
              VPS and cloud products. We keep our catalog small on purpose —
              we&apos;d rather ship fewer products and make them genuinely
              reliable than fill a pricing page.
            </p>
            <p>
              This is a template page. Replace with your real company story,
              team, and history before launching.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="What we care about" title="Values" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.k}
                className="glass glass-hover rounded-2xl p-6"
              >
                <h3 className="text-base font-semibold">{v.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.v}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.k} className="bg-card p-8">
                <div className="text-4xl font-semibold tracking-tight">
                  {s.v}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {s.k}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </SiteShell>
  )
}
