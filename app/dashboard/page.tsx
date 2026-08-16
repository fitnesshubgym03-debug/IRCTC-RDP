import Link from "next/link"
import { Activity, ArrowRight, Clock3, Server, ShieldCheck } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { formatINR, getPlanById } from "@/data/plans"

export const metadata = { title: "Dashboard" }

const activePlan = getPlanById("intel-6c-16gb")!
const platformName = activePlan.platform === "Intel" ? "Intel Xeon" : "AMD Ryzen 9 9950X3D"

export default function Page() {
  return (
    <SiteShell>
      <Container className="py-16 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              CLIENT DASHBOARD / DEMO MODE
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Good morning, operator.
            </h1>
            <p className="mt-3 text-muted-foreground">Your active infrastructure at a glance.</p>
          </div>
          <Button asChild>
            <Link href="/rdp-plans">
              Deploy another desk <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <Server className="size-5 text-accent" />
            <p className="mt-5 text-sm text-muted-foreground">Active servers</p>
            <p className="mt-1 text-3xl font-semibold">1</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Activity className="size-5 text-accent" />
            <p className="mt-5 text-sm text-muted-foreground">Network health</p>
            <p className="mt-1 text-3xl font-semibold">99.99%</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Clock3 className="size-5 text-accent" />
            <p className="mt-5 text-sm text-muted-foreground">Session uptime</p>
            <p className="mt-1 text-3xl font-semibold">14d 08h</p>
          </div>
        </div>

        <div className="glass mt-6 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-accent">
                ACTIVE SERVER
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {platformName} · {activePlan.name} · Mumbai
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activePlan.cpuCores} Cores · {activePlan.ramGB} GB RAM · {formatINR(activePlan.priceINR)}
                /mo
              </p>
            </div>
            <span className="flex items-center gap-2 text-sm text-accent">
              <span className="size-2 rounded-full bg-accent" />
              Running
            </span>
          </div>

          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-muted-foreground">RDP endpoint</p>
              <p className="mt-2 font-mono">bom-01.irctcrdp.com</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-muted-foreground">Last health check</p>
              <p className="mt-2 font-mono">12 ms latency</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-muted-foreground">Protection</p>
              <p className="mt-2 flex items-center gap-2">
                <ShieldCheck className="size-4 text-accent" />
                Enabled
              </p>
            </div>
          </div>
        </div>
      </Container>
    </SiteShell>
  )
}