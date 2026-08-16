import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { FeatureCard } from "@/components/feature-card"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Network,
  Layers,
  Workflow,
  GitBranch,
  Cpu,
  CloudCog,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Cloud Hosting",
  description:
    "Scalable cloud hosting with private networking, automated scaling, and a fully API-driven platform.",
}

const features = [
  { icon: CloudCog, title: "API-driven platform", description: "Programmatic control over every resource via a clean REST API." },
  { icon: Network, title: "Private networking", description: "Low-latency interconnects between your cloud instances within a region." },
  { icon: Layers, title: "Fixed instance sizes", description: "Eight fixed Intel Xeon and AMD Ryzen 9 9950X3D tiers with predictable specs and pricing." },
  { icon: Workflow, title: "Automated scaling", description: "Horizontal scaling with health checks and predictable rollouts." },
  { icon: GitBranch, title: "Infrastructure as code", description: "Terraform provider and CLI workflows for reproducible environments." },
  { icon: Cpu, title: "Compute optimized", description: "Dedicated-core instance classes for consistent performance profiles." },
]

export default function CloudPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Cloud hosting"
        title="Cloud infrastructure, without the invoice surprises."
        description="A small, focused cloud platform built around predictable performance, private networking, and a clean API."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/pricing">Browse RDP plans</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Talk to an engineer</Link>
          </Button>
        </div>
      </PageHeader>

      <section className="py-16">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Capabilities"
            title="Built for teams running production"
            description="Everything listed here is available today on every cloud region."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </SiteShell>
  )
}
