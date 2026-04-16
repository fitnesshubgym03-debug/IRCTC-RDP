import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { PlanCard } from "@/components/plans/plan-card"
import { Button } from "@/components/ui/button"
import { plans } from "@/data/plans"

export function PlansPreview() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="VPS plans"
            title="Predictable performance, transparent prices"
            description="Four production-ready tiers with full root access, NVMe storage, and a clear upgrade path. Prices are shown in INR, monthly."
          />
          <Button asChild variant="ghost" className="gap-1.5">
            <Link href="/pricing">
              Compare all plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </Container>
    </section>
  )
}
