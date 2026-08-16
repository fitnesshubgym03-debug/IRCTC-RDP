"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, Gauge, MapPin, Network, Play, Radio, Route, Zap } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const stages = [
  "Initializing route...",
  "Finding nearest edge...",
  "Testing latency...",
  "Testing download...",
  "Testing upload...",
  "Finalizing results...",
]

const routes = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad"]

function randomTbps(min: number, max: number) {
  return (min + Math.random() * (max - min)).toFixed(2)
}

function CountUp({ value, suffix, active }: { value: string; suffix: string; active: boolean }) {
  const target = Number(value)
  const [display, setDisplay] = useState(active ? "0.00" : value)

  useEffect(() => {
    if (!active) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const duration = 850
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay((target * eased).toFixed(2))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, value])

  return <>{display}{suffix}</>
}

function ResultCard({ label, value, suffix, icon, active }: { label: string; value: string; suffix: string; icon: React.ReactNode; active: boolean }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 text-center transition-all duration-500 data-[active=true]:animate-[row-in_400ms_ease-out]" data-active={active}>
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
        {label === "LATENCY" ? "-1 ms" : <CountUp value={value} suffix={suffix} active={active} />}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label[0] + label.slice(1).toLowerCase()}</p>
    </div>
  )
}

export default function Page() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [download, setDownload] = useState("0.00")
  const [upload, setUpload] = useState("0.00")
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current)
  }, [])

  const currentRoute = useMemo(() => routes[(stage + 1) % routes.length], [stage])

  function run() {
    if (running) return
    setRunning(true)
    setDone(false)
    setStage(0)
    setProgress(0)
    setDownload("0.00")
    setUpload("0.00")

    const started = performance.now()
    timer.current = window.setInterval(() => {
      const elapsed = performance.now() - started
      const nextProgress = Math.min(Math.round((elapsed / 3200) * 100), 100)
      setProgress(nextProgress)
      setStage(Math.min(Math.floor(nextProgress / 17), stages.length - 1))
      if (nextProgress >= 100) {
        if (timer.current) window.clearInterval(timer.current)
        setDownload(randomTbps(1.05, 9.99))
        setUpload(randomTbps(1.02, 8.99))
        setRunning(false)
        setDone(true)
      }
    }, 80)
  }

  return (
    <SiteShell>
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--accent)_12%,transparent),transparent_68%)]" />
        <Container className="relative py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">03 / SPEED TEST</p>
          <div className="mt-5 flex max-w-4xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">Measure the route before you deploy.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Run an animated India edge diagnostic across the IRCTC RDP route map.</p>
            </div>
            <div className="glass flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-400" /> SIMULATED RESULT
            </div>
          </div>

          <div className="glass glass-strong relative mt-12 overflow-hidden rounded-3xl p-5 sm:p-8">
            <div className="pointer-events-none absolute inset-x-10 top-24 hidden h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent sm:block" />
            <div className="pointer-events-none absolute inset-x-20 top-24 hidden sm:block">
              <div className="flex justify-between">
                {routes.map((route, index) => <span key={route} className={`relative size-2 rounded-full bg-accent shadow-[0_0_16px_var(--accent)] transition-opacity ${running || index === 0 ? "opacity-100" : "opacity-50"}`}><span className="absolute -inset-1 rounded-full border border-accent/30" /></span>)}
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="glass flex size-12 items-center justify-center rounded-2xl text-accent"><Gauge className="size-6" /></div>
                <div>
                  <p className="font-semibold">India edge diagnostic</p>
                  <p className="text-sm text-muted-foreground">Mumbai · Delhi · Bengaluru · Hyderabad</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Radio className="size-3 text-emerald-400" /> DEMO ROUTE / {currentRoute.toUpperCase()}
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 font-mono text-xs">
                <span className={running ? "text-accent" : "text-muted-foreground"}>{running ? stages[stage] : done ? "Route diagnostic complete." : "Ready to initialize demo route."}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-accent via-orange-300 to-emerald-400 transition-[width] duration-100" style={{ width: `${progress}%` }} />
              </div>
              <div className="relative mt-5 h-12 overflow-hidden rounded-xl border border-border/50 bg-background/50">
                <div className={`absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/30 to-transparent blur-sm ${running ? "animate-[route-scan_1.1s_linear_infinite]" : "opacity-20"}`} />
                <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
                <div className={`absolute left-1/4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_16px_4px_color-mix(in_oklch,var(--accent)_70%,transparent)] ${running ? "animate-[packet-travel_1.2s_linear_infinite]" : ""}`} />
                <div className={`absolute left-1/2 top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_4px_color-mix(in_oklch,var(--accent)_70%,transparent)] ${running ? "animate-[packet-travel_1.5s_linear_infinite_200ms]" : ""}`} />
                <div className={`absolute left-2/3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_16px_4px_rgba(52,211,153,0.4)] ${running ? "animate-[packet-travel_1.8s_linear_infinite_400ms]" : ""}`} />
              </div>
            </div>

            <Button onClick={run} disabled={running} className="mt-6 w-full sm:w-auto">
              {running ? <><Network data-icon="inline-start" /> Testing route...</> : <><Play data-icon="inline-start" /> Run speed test</>}
            </Button>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ResultCard label="LATENCY" value="-1" suffix=" ms" icon={<Route className="size-5" />} active={done} />
              <ResultCard label="DOWNLOAD" value={download} suffix=" Tbps" icon={<Zap className="size-5" />} active={done} />
              <ResultCard label="UPLOAD" value={upload} suffix=" Tbps" icon={<Network className="size-5" />} active={done} />
            </div>

            {done && <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300"><CheckCircle2 className="size-4" /> ROUTE READY <span className="text-muted-foreground">/ simulated interface state</span></div>}
            <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs leading-relaxed text-muted-foreground"><span className="font-mono font-semibold text-accent">SIMULATED RESULT</span><br />Results are simulated for demonstration purposes and do not represent an actual measurement of your internet connection. Actual internet performance varies by connection, location and network conditions.</div>
          </div>
        </Container>
      </main>
    </SiteShell>
  )
}

// Deliberately restrained motion keeps the diagnostic legible on small screens.
// The reduced-motion preference is handled by the global animation utilities.
