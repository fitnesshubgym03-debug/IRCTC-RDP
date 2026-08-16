import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Configurator } from "@/components/configure/configurator"
import { getPlanById, plans } from "@/data/plans"

export const metadata: Metadata = {
  title: "Configure your RDP",
  description:
    "Review your selected IRCTC RDP plan, choose region, OS, and billing cycle, then continue to secure checkout.",
}

export default async function ConfigurePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan: planId } = await searchParams
  const plan = getPlanById(planId) ?? plans.find((item) => item.popular) ?? plans[0]

  if (!planId || !getPlanById(planId)) {
    return (
      <SiteShell>
        <PageHeader
          eyebrow="Configure"
          title="Choose a plan to configure."
          description="Pick one of our Intel or AMD Ryzen 9 9950X3D plans to start your deployment."
        />
        <section className="py-12 sm:py-16">
          <Container className="flex flex-col items-start gap-4">
            <p className="text-muted-foreground">
              No plan selected. Browse the available plans and select one to continue.
            </p>
            <Button asChild>
              <Link href="/pricing">View all plans</Link>
            </Button>
          </Container>
        </section>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Configure"
        title="Confirm your deployment."
        description="Your plan specs are fixed for this tier. Choose region, OS, and billing cycle, then continue to checkout."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <Configurator plan={plan} />
        </Container>
      </section>
    </SiteShell>
  )
}
