import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Configurator } from "@/components/configure/configurator"

export const metadata: Metadata = {
  title: "Custom Configuration",
  description:
    "Build a VPS to your exact specification. Pick CPU, RAM, storage, bandwidth, OS, and region with a live quote.",
}

export default function ConfigurePage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Configurator"
        title="Spec your server, not a marketing plan."
        description="Tune every axis that actually matters and get a live, transparent quote."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <Configurator />
        </Container>
      </section>
    </SiteShell>
  )
}
