import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-dot opacity-50" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Deploy in minutes. Scale with confidence.
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
                Spin up a VPS, configure a custom build, or talk with our team
                about enterprise-grade infrastructure.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-1.5">
                <Link href="/configure">
                  Deploy now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
