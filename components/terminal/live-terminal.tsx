"use client"

/**
 * LiveTerminal
 * ---------------------------------------------------------------
 * A UI-only simulation of a ZWS Cloud terminal/dashboard panel.
 * Displays:
 *   - Animated ping (1-5 ms, smoothed)
 *   - Uptime counter from a fixed launch timestamp (days/hrs/min/sec)
 *   - Simulated upload + download speeds (1-25 Gbps, animated)
 *   - Realistic latency in ms with smooth updates
 *   - Terminal-style streaming log lines
 *
 * NOTE: Zero backend. Uses setInterval + smoothing. Respects
 * prefers-reduced-motion. Backend developers can replace each
 * simulated value with a real WebSocket or polling source.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Cpu,
  Gauge,
  Radio,
  ShieldCheck,
  Timer,
  Wifi,
} from "lucide-react"

// Fixed "launch" timestamp for the uptime counter. Edit freely.
const LAUNCH_ISO = "2024-03-01T00:00:00Z"

type LogLine = {
  id: number
  time: string
  kind: "info" | "ok" | "warn" | "accent"
  message: string
}

const LOG_POOL: Array<Omit<LogLine, "id" | "time">> = [
  { kind: "info", message: "provisioning node bom-03 · 2 vCPU · 4 GB RAM" },
  { kind: "accent", message: "routing traffic through fra-edge-07" },
  { kind: "ok", message: "SLA monitoring healthy · 99.998% window" },
  { kind: "info", message: "network active · 10 Gbps uplink · anycast on" },
  { kind: "ok", message: "snapshot saved · vol-5ac8 · 36.2s" },
  { kind: "info", message: "deploying image ubuntu:24.04 · layer 4/6" },
  { kind: "accent", message: "peering accepted · AS13335 · 0.9 ms" },
  { kind: "warn", message: "retrying region nyc-1 healthcheck (2/3)" },
  { kind: "ok", message: "healthcheck nyc-1 recovered · 1.4 ms" },
  { kind: "info", message: "ddos filter engaged · drop rate 0.00%" },
  { kind: "accent", message: "autoscale trigger · +1 node blr-07" },
  { kind: "ok", message: "tls handshake · ECDHE-X25519 · 42 ms" },
]

export function LiveTerminal() {
  const reducedMotion = usePrefersReducedMotion()

  // --- Metrics ------------------------------------------------------------
  const [ping, setPing] = useState(2.1)
  const [latency, setLatency] = useState(12)
  const [download, setDownload] = useState(12.4)
  const [upload, setUpload] = useState(8.1)
  const [uptime, setUptime] = useState(() => formatUptime(LAUNCH_ISO))

  // Refs let us read "current" values inside intervals without re-binding.
  const pingRef = useRef(ping)
  const latencyRef = useRef(latency)
  const downloadRef = useRef(download)
  const uploadRef = useRef(upload)
  pingRef.current = ping
  latencyRef.current = latency
  downloadRef.current = download
  uploadRef.current = upload

  useEffect(() => {
    // Uptime: tick every second. Cheap formatting.
    const uid = setInterval(() => setUptime(formatUptime(LAUNCH_ISO)), 1000)
    return () => clearInterval(uid)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    // Smoothly drift metrics so the dashboard feels alive.
    const id = setInterval(() => {
      setPing((p) => smooth(p, rand(1, 5), 0.35))
      setLatency((l) => clamp(smooth(l, rand(8, 28), 0.25), 5, 60))
      setDownload((d) => smooth(d, rand(1, 25), 0.18))
      setUpload((u) => smooth(u, rand(1, 25), 0.18))
    }, 900)
    return () => clearInterval(id)
  }, [reducedMotion])

  // --- Logs ---------------------------------------------------------------
  const [logs, setLogs] = useState<LogLine[]>(() => seedLogs(4))
  const logSeq = useRef(logs.length)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(-6), newLog(++logSeq.current)]
        return next
      })
    }, 1800)
    return () => clearInterval(id)
  }, [reducedMotion])

  // --- Derived ------------------------------------------------------------
  const utilization = useMemo(
    () => Math.round(clamp((download / 25) * 100, 4, 99)),
    [download]
  )

  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-[0_20px_80px_-20px_color-mix(in_oklch,var(--accent)_20%,transparent)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_currentColor] text-accent"
            aria-hidden
          />
          zws-cloud · live
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <Radio className="h-3 w-3 text-accent" />
          {ping.toFixed(1)} ms
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px bg-border/30 sm:grid-cols-4">
        <Metric
          icon={Timer}
          label="Uptime"
          value={uptime}
          compact
        />
        <Metric
          icon={Gauge}
          label="Latency"
          value={`${latency.toFixed(0)} ms`}
          trend={latency < 15 ? "up" : "steady"}
        />
        <Metric
          icon={ArrowDown}
          label="Download"
          value={`${download.toFixed(1)} Gbps`}
          pulse
        />
        <Metric
          icon={ArrowUp}
          label="Upload"
          value={`${upload.toFixed(1)} Gbps`}
          pulse
        />
      </div>

      {/* Utilization bar */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-accent" />
            network utilization
          </span>
          <span className="tabular-nums text-foreground">{utilization}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent/60 via-accent to-accent/60 shadow-[0_0_10px_0_currentColor] transition-[width] duration-700 ease-out text-accent"
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      {/* Terminal logs */}
      <div className="px-5 pb-5 pt-4">
        <div className="rounded-xl border border-border/50 bg-background/50 p-4 font-mono text-[12px] leading-relaxed">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-accent" />
              event stream
            </span>
            <span>/var/log/zws-cloud.log</span>
          </div>
          <div className="flex flex-col">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <span className="text-accent">$</span>
              <span className="term-caret" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {/* Footer stat strip */}
      <div className="flex items-center justify-between gap-3 px-5 pb-5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span>DDoS mitigation · active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-accent" />
          <span>4 regions · healthy</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function Metric({
  icon: Icon,
  label,
  value,
  trend,
  pulse,
  compact,
}: {
  icon: typeof Timer
  label: string
  value: string
  trend?: "up" | "steady"
  pulse?: boolean
  compact?: boolean
}) {
  return (
    <div className="relative flex flex-col gap-1 bg-background/30 px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-accent" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`tabular-nums font-semibold text-foreground ${
            compact ? "text-[13px]" : "text-sm"
          }`}
        >
          {value}
        </span>
        {pulse && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor] text-accent"
            aria-hidden
          />
        )}
        {trend === "up" && (
          <span className="text-[10px] text-accent" aria-hidden>
            ↑
          </span>
        )}
      </div>
    </div>
  )
}

function LogRow({ log }: { log: LogLine }) {
  const kindColor =
    log.kind === "ok"
      ? "text-accent"
      : log.kind === "warn"
      ? "text-amber-400"
      : log.kind === "accent"
      ? "text-accent"
      : "text-muted-foreground"
  const symbol =
    log.kind === "ok" ? "✓" : log.kind === "warn" ? "!" : "→"

  return (
    <div className="term-fade-in flex gap-2 py-0.5">
      <span className="shrink-0 text-muted-foreground/70">{log.time}</span>
      <span className={`shrink-0 ${kindColor}`}>{symbol}</span>
      <span className="break-all text-foreground/90">{log.message}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function seedLogs(n: number): LogLine[] {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => {
    const src = LOG_POOL[i % LOG_POOL.length]
    return {
      id: i + 1,
      time: formatTime(new Date(now - (n - i) * 1800)),
      kind: src.kind,
      message: src.message,
    }
  })
}

function newLog(id: number): LogLine {
  const src = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)]
  return {
    id,
    time: formatTime(new Date()),
    kind: src.kind,
    message: src.message,
  }
}

function formatTime(d: Date) {
  const hh = d.getHours().toString().padStart(2, "0")
  const mm = d.getMinutes().toString().padStart(2, "0")
  const ss = d.getSeconds().toString().padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

function formatUptime(launchIso: string) {
  const diff = Math.max(0, Date.now() - new Date(launchIso).getTime())
  const s = Math.floor(diff / 1000)
  const days = Math.floor(s / 86_400)
  const hrs = Math.floor((s % 86_400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  return `${days}d ${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function smooth(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])
  return reduced
}
