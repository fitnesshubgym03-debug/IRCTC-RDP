import Link from "next/link"
import { ArrowRight, Activity, ShieldCheck, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { LiveTerminal } from "@/components/terminal/live-terminal"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft accent glow above the global dot field */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Link
              href="/infrastructure"
              className="glass-panel group inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor] text-accent" />
              New region: Mumbai added · 99.99% uptime
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem] lg:leading-[1.02]">
              Cloud infrastructure,{" "}
              <span className="bg-gradient-to-br from-muted-foreground to-foreground/60 bg-clip-text text-transparent">
                without the friction.
              </span>
            </h1>

            <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              High-performance VPS, cloud hosting, and custom server builds on
              NVMe storage. Transparent pricing, full root access, and
              operations-grade support.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-1.5">
                <Link href="/configure">
                  Start deploying
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View plans</Link>
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                DDoS protected
              </span>
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                99.99% uptime SLA
              </span>
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" />
                Full root access
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/15 via-accent/5 to-transparent blur-2xl" />
            <LiveTerminal />
          </div>
        </div>
      </Container>
    </section>
  )
}
