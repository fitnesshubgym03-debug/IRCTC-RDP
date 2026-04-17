import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Server } from "lucide-react"
import { CTASection } from "@/components/cta-section"

export const metadata: Metadata = {
  title: "Dedicated Servers",
  description:
    "Bare-metal dedicated servers for demanding, high-performance workloads. Coming soon.",
}

export default function DedicatedPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Dedicated servers"
        title="Bare metal, reserved for you."
        description="Fully isolated dedicated hardware for demanding workloads. We're currently finalizing our dedicated catalog — reach out to register interest."
      />
      <Container className="py-16">
        <Empty className="glass rounded-2xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Server className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>Dedicated server catalog launching soon</EmptyTitle>
            <EmptyDescription>
              We're rolling out dedicated hardware region by region. If you need
              bare-metal capacity now, we can reserve it for you via our sales
              team.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/contact?subject=dedicated">Register interest</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/vps">Browse VPS plans</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </Container>
      <CTASection />
    </SiteShell>
  )
}
