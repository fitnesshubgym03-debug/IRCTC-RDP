"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Cpu,
  Gauge,
  Globe,
  HardDrive,
  MemoryStick,
  MonitorCog,
  Network,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { billingCycleMultiplier, type BillingCycle } from "@/data/plans"

const operatingSystems = [
  "Ubuntu 24.04 LTS",
  "Debian 12",
  "Rocky Linux 9",
  "AlmaLinux 9",
  "CentOS Stream 9",
  "Windows Server 2022 (+₹500/mo)",
]

const regions = [
  "Mumbai (BOM)",
  "Bengaluru (BLR)",
  "Singapore (SIN)",
  "Frankfurt (FRA)",
  "New York (NYC)",
]

const bandwidthOptions = [
  { label: "1 TB", value: 1 },
  { label: "2 TB", value: 2 },
  { label: "4 TB", value: 4 },
  { label: "8 TB", value: 8 },
  { label: "Unmetered", value: 12 },
]

export function Configurator() {
  const [cpu, setCpu] = useState<number[]>([4])
  const [ram, setRam] = useState<number[]>([8])
  const [storage, setStorage] = useState<number[]>([160])
  const [bandwidth, setBandwidth] = useState<number>(2)
  const [os, setOs] = useState(operatingSystems[0])
  const [region, setRegion] = useState(regions[0])
  const [cycle, setCycle] = useState<BillingCycle>("monthly")
  const [submitting, setSubmitting] = useState(false)

  const perMonth = useMemo(() => {
    const osCharge = os.includes("Windows") ? 500 : 0
    return cpu[0] * 250 + ram[0] * 60 + storage[0] * 4 + bandwidth * 40 + osCharge
  }, [cpu, ram, storage, bandwidth, os])

  const total = Math.round(perMonth * billingCycleMultiplier[cycle])
  const effectivePerMonth = Math.round(
    total / (cycle === "monthly" ? 1 : cycle === "quarterly" ? 3 : 12)
  )

  async function handleOrder() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/order-placeholder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpu: cpu[0],
          ram: ram[0],
          storage: storage[0],
          bandwidth,
          os,
          region,
          cycle,
          total,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      toast.success("Order request received", {
        description: "Our team will reach out with next steps shortly.",
      })
    } catch (e) {
      toast.error("Something went wrong", {
        description: "Please try again or contact support.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Compute
          </h2>
          <div className="mt-6 flex flex-col gap-8">
            <SliderRow
              icon={Cpu}
              label="vCPU"
              unit="cores"
              value={cpu[0]}
              min={1}
              max={32}
              step={1}
              onChange={setCpu}
            />
            <SliderRow
              icon={MemoryStick}
              label="Memory"
              unit="GB"
              value={ram[0]}
              min={2}
              max={128}
              step={2}
              onChange={setRam}
            />
            <SliderRow
              icon={HardDrive}
              label="Storage"
              unit="GB NVMe"
              value={storage[0]}
              min={40}
              max={2000}
              step={20}
              onChange={setStorage}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Network & image
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <SelectField
              icon={Network}
              label="Bandwidth"
              value={bandwidth.toString()}
              onChange={(v) => setBandwidth(Number(v))}
              options={bandwidthOptions.map((b) => ({
                label: b.label,
                value: b.value.toString(),
              }))}
            />
            <SelectField
              icon={Globe}
              label="Region"
              value={region}
              onChange={setRegion}
              options={regions.map((r) => ({ label: r, value: r }))}
            />
            <SelectField
              icon={MonitorCog}
              label="Operating system"
              value={os}
              onChange={setOs}
              options={operatingSystems.map((o) => ({ label: o, value: o }))}
              wide
            />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-accent" />
              Billing cycle
            </div>
            <RadioGroup
              value={cycle}
              onValueChange={(v) => setCycle(v as BillingCycle)}
              className="grid grid-cols-3 gap-2"
            >
              {(["monthly", "quarterly", "annual"] as BillingCycle[]).map(
                (c) => (
                  <Label
                    key={c}
                    htmlFor={`cfg-cycle-${c}`}
                    className="glass flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm capitalize text-muted-foreground transition-colors hover:text-foreground has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:text-foreground"
                  >
                    <RadioGroupItem
                      id={`cfg-cycle-${c}`}
                      value={c}
                      className="sr-only"
                    />
                    {c}
                    {c === "quarterly" && (
                      <span className="ml-1 text-xs text-accent">−5%</span>
                    )}
                    {c === "annual" && (
                      <span className="ml-1 text-xs text-accent">−17%</span>
                    )}
                  </Label>
                )
              )}
            </RadioGroup>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass glass-strong flex flex-col rounded-2xl p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your build
          </h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">
              ₹{total.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              /{cycle === "monthly" ? "mo" : cycle === "quarterly" ? "quarter" : "yr"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ≈ ₹{effectivePerMonth.toLocaleString()}/mo effective
          </p>

          <dl className="mt-6 flex flex-col gap-3 pt-5 text-sm">
            <SummaryRow k="vCPU" v={`${cpu[0]} cores`} />
            <SummaryRow k="Memory" v={`${ram[0]} GB DDR4`} />
            <SummaryRow k="Storage" v={`${storage[0]} GB NVMe`} />
            <SummaryRow
              k="Bandwidth"
              v={
                bandwidthOptions.find((b) => b.value === bandwidth)?.label ??
                `${bandwidth} TB`
              }
            />
            <SummaryRow k="OS" v={os} />
            <SummaryRow k="Region" v={region} />
            <SummaryRow k="Cycle" v={cycle} />
          </dl>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
            <span>
              Deploy-ready in under 60 seconds. Cancel anytime within the
              Refund Policy window.
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={handleOrder} disabled={submitting} className="w-full gap-1.5">
              {submitting ? (
                <>
                  <Spinner className="size-4" />
                  Submitting
                </>
              ) : (
                <>
                  Place order
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/contact">Request a tailored quote</a>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" />
          Quote updates live as you adjust your build.
        </div>
      </aside>
    </div>
  )
}

function SliderRow({
  icon: Icon,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: typeof Cpu
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number[]) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-accent" />
          {label}
        </div>
        <div className="font-mono text-sm text-foreground">
          {value} {unit}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

function SelectField({
  icon: Icon,
  label,
  value,
  onChange,
  options,
  wide,
}: {
  icon: typeof Cpu
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  wide?: boolean
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground capitalize">{k}</dt>
      <dd className="text-right font-medium text-foreground">{v}</dd>
    </div>
  )
}
