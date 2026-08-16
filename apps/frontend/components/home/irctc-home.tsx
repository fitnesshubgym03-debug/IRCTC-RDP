import Link from "next/link"
import { ArrowRight, Gauge, MapPin, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { PlanCard } from "@/components/plans/plan-card"
import { plans } from "@/data/plans"

// Curated highlights for the homepage; the full catalog lives on /pricing.
const featuredPlans = [
  plans.find((plan) => plan.id === "intel-6c-16gb"),
  plans.find((plan) => plan.id === "ryzen-6c-16gb"),
].filter((plan): plan is (typeof plans)[number] => Boolean(plan))

export function IrctcHome() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-accent/10 blur-3xl" />
        <Container className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:py-32">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
              IRCTC RDP / INDIA EDGE
            </p>
            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
              Your remote desk, ready when the window opens.
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Fast, persistent Windows RDP infrastructure for railway booking workflows. Low-latency
              India locations, NVMe storage, and support that speaks your language.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  View RDP plans <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/speed-test">Test your route</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-accent" />
                Session-ready infrastructure
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-accent" />
                India locations
              </span>
            </div>
          </div>
          <div className="glass-strong relative overflow-hidden rounded-2xl p-5 font-mono text-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">irctc-rdp / control</span>
              <span className="flex items-center gap-2 text-accent">
                <span className="size-2 rounded-full bg-accent" /> operational
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-5">
              <div className="rounded-xl bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">nearest node</p>
                <p className="mt-2 text-xl text-foreground">Mumbai</p>
                <p className="mt-1 text-xs text-accent">8–14 ms typical</p>
              </div>
              <div className="rounded-xl bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">platform</p>
                <p className="mt-2 text-xl text-foreground">Intel · Ryzen</p>
                <p className="mt-1 text-xs text-accent">NVMe SSD</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border/60 bg-card/20">
        <Container className="grid gap-4 py-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Gauge className="size-5 text-accent" />
            <span className="text-sm">Low-latency India routes</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-accent" />
            <span className="text-sm">Reliable remote sessions</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-accent" />
            <span className="text-sm">Four operational locations</span>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-20 sm:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
                PLANS / SIMPLE PRICING
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Choose your booking desk.
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                Compare all plans <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-card/20">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
              BUILT FOR THE WINDOW
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Less waiting. More control.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <ShieldCheck className="size-6 text-accent" />
              <h3 className="mt-8 text-xl font-semibold">Keep your session alive</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A persistent workspace means your browser, bookmarks, and operational setup are ready
                when you are.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <Gauge className="size-6 text-accent" />
              <h3 className="mt-8 text-xl font-semibold">See the route clearly</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Test locations before you commit and choose the node that gives your workflow the
                cleanest path.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-20 text-center sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            READY WHEN YOU ARE
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-4xl font-semibold sm:text-6xl">
            Put your remote desk on the right track.
          </h2>
          <Button className="mt-8" size="lg" asChild>
            <Link href="/pricing">
              Explore plans <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </Container>
      </section>
    </>
  )
}
