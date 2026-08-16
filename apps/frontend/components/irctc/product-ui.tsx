import Link from "next/link"
import { ArrowRight, MapPin, Gauge, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { CpuLogo } from "@/components/plans/cpu-logo"
import { PlanCard } from "@/components/plans/plan-card"
import { plans, type Plan } from "@/data/plans"
import { locations } from "@/data/rdp"

const intelPlans = plans.filter((plan) => plan.platform === "Intel")
const ryzenPlans = plans.filter((plan) => plan.platform === "AMD Ryzen 9 9950X3D")

function PlatformSection({ name, brand, plans: sectionPlans }: { name: string; brand: "Intel" | "Ryzen"; plans: Plan[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <CpuLogo brand={brand} className="h-7 sm:h-8" />
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sectionPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}

export function PlanGrid() {
  return (
    <Container className="flex flex-col gap-12 py-16">
      <PlatformSection name="Intel Xeon" brand="Intel" plans={intelPlans} />
      <PlatformSection name="AMD Ryzen 9 9950X3D" brand="Ryzen" plans={ryzenPlans} />
    </Container>
  )
}

export function ProductHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="relative overflow-hidden border-b border-border/60"><div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-accent/10 blur-3xl" /><Container className="relative py-20 sm:py-28"><p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">{eyebrow}</p><h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl">{title}</h1><p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p></Container></section>
}

export function LocationGrid() { return <Container className="grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-4">{locations.map((location) => <article key={location.code} className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><MapPin className="size-5 text-accent" /><span className="size-2 rounded-full bg-accent" /></div><h2 className="mt-6 text-xl font-semibold">{location.city}</h2><p className="mt-1 font-mono text-xs text-muted-foreground">{location.code}</p><div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm"><span className="text-muted-foreground">Typical latency</span><span className="font-mono text-accent">{location.latency}</span></div></article>)}</Container> }

export function TrustRail() { return <Container className="grid gap-4 py-12 sm:grid-cols-3"><div className="glass rounded-xl p-5"><Gauge className="size-5 text-accent" /><p className="mt-4 font-semibold">Low-latency routes</p><p className="mt-1 text-sm text-muted-foreground">India-first network paths built for responsive sessions.</p></div><div className="glass rounded-xl p-5"><ShieldCheck className="size-5 text-accent" /><p className="mt-4 font-semibold">Session stability</p><p className="mt-1 text-sm text-muted-foreground">Keep your remote workspace ready through peak windows.</p></div><div className="glass rounded-xl p-5"><MapPin className="size-5 text-accent" /><p className="mt-4 font-semibold">Four live locations</p><p className="mt-1 text-sm text-muted-foreground">Choose the node nearest to your booking workflow.</p></div></Container> }

export function DeployCta() {
  return (
    <Container className="flex flex-col items-center gap-4 py-14 text-center">
      <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Ready to pick your desk?
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Choose one of the eight fixed plans and deploy in minutes.
      </p>
      <Button asChild size="lg" className="gap-1.5">
        <Link href="/pricing">
          Compare all plans <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Container>
  )
}