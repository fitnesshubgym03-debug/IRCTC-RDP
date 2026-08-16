import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { PlanCard } from "@/components/plans/plan-card"
import { SectionHeader } from "@/components/layout/section-header"
import { FeatureCard } from "@/components/feature-card"
import { CTASection } from "@/components/cta-section"
import { plans } from "@/data/plans"
import { Cpu, HardDrive, Network, ShieldCheck, Terminal, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "VPS Hosting",
  description:
    "High-performance VPS hosting on NVMe storage with DDoS protection, full root access, and transparent pricing.",
}

const vpsFeatures = [
  { icon: Cpu, title: "Dedicated vCPU options", description: "Choose between shared and fully dedicated vCPU for predictable latency." },
  { icon: HardDrive, title: "NVMe SSD everywhere", description: "Enterprise NVMe storage across every plan for high IOPS and low latency." },
  { icon: Network, title: "1 Gbps uplink", description: "1 Gbps network port on every VPS, with generous bandwidth allocations." },
  { icon: ShieldCheck, title: "DDoS protection", description: "Always-on network-layer protection — no opt-in required." },
  { icon: Terminal, title: "Full root access", description: "Install any OS template, run any workload within our AUP." },
  { icon: Zap, title: "Sub-minute provisioning", description: "Typical deployments complete in under 60 seconds." },
]

export default function VPSPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="VPS hosting"
        title="Production-ready VPS, priced to make sense."
        description="Four tiers engineered for real workloads, with an upgrade path you won't outgrow in a week."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/rdp-plans">Browse RDP plans</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">Compare pricing</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="py-16">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Included with every VPS"
            title="The fundamentals, done right"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vpsFeatures.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </SiteShell>
  )
}
