import Link from "next/link"
import { ArrowRight, Terminal, Activity, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Link
              href="/infrastructure"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              New region: Mumbai added · 99.99% uptime
              <ArrowRight className="h-3 w-3" />
            </Link>

            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem] lg:leading-[1.02]">
              Cloud infrastructure,{" "}
              <span className="text-muted-foreground">without the friction.</span>
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

          <HeroVisual />
        </div>
      </Container>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            zws-cloud · dashboard
          </div>
          <div className="w-12" />
        </div>

        <div className="p-5 font-mono text-[12px] leading-relaxed">
          <TerminalLine prompt prefix="~">
            <span className="text-muted-foreground">
              zws deploy --plan business --region mumbai
            </span>
          </TerminalLine>
          <TerminalLine>
            <span className="text-accent">→</span>{" "}
            <span className="text-foreground">Provisioning VPS</span>
            <span className="text-muted-foreground"> (2 vCPU · 4 GB · 80 GB NVMe)</span>
          </TerminalLine>
          <TerminalLine>
            <span className="text-accent">→</span>{" "}
            <span className="text-foreground">Attaching network</span>
            <span className="text-muted-foreground"> 2 TB · 1 Gbps · IPv4+IPv6</span>
          </TerminalLine>
          <TerminalLine>
            <span className="text-accent">→</span>{" "}
            <span className="text-foreground">Installing Ubuntu 24.04 LTS</span>
          </TerminalLine>
          <TerminalLine>
            <span className="text-accent">✓</span>{" "}
            <span className="text-foreground">Ready</span>
            <span className="text-muted-foreground"> in 34.2s · ssh root@185.10.x.x</span>
          </TerminalLine>
        </div>

        <div className="grid grid-cols-3 border-t border-border">
          <Metric label="CPU" value="2 vCPU" sub="3.2 GHz" />
          <Metric label="Memory" value="4 GB" sub="DDR4" border />
          <Metric label="Storage" value="80 GB" sub="NVMe SSD" />
        </div>
      </div>
    </div>
  )
}

function TerminalLine({
  children,
  prompt,
  prefix,
}: {
  children: React.ReactNode
  prompt?: boolean
  prefix?: string
}) {
  return (
    <div className="flex gap-2 py-0.5">
      {prompt && (
        <span className="text-muted-foreground">{prefix ?? "$"}</span>
      )}
      <span className="flex-1 break-all">{children}</span>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
  border,
}: {
  label: string
  value: string
  sub: string
  border?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 px-4 py-3.5 ${
        border ? "border-x border-border" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  )
}
