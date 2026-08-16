"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Cpu,
  Globe,
  HardDrive,
  MemoryStick,
  MonitorCog,
  Network,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CpuLogo } from "@/components/plans/cpu-logo"
import {
  billingCycleLabel,
  deployRegions,
  formatINR,
  osImages,
  priceForCycle,
  type BillingCycle,
  type Plan,
} from "@/data/plans"

const cycles: BillingCycle[] = ["monthly", "quarterly", "annual"]

export function Configurator({ plan }: { plan: Plan }) {
  const router = useRouter()
  const isRyzen = plan.platform === "AMD Ryzen 9 9950X3D"

  const [region, setRegion] = useState<string>(deployRegions[0])
  const [osImage, setOsImage] = useState<string>(osImages[0])
  const [cycle, setCycle] = useState<BillingCycle>("monthly")
  const [email, setEmail] = useState("")
  const [hostname, setHostname] = useState("")

  const total = useMemo(() => priceForCycle(plan, cycle), [plan, cycle])
  const months = cycle === "monthly" ? 1 : cycle === "quarterly" ? 3 : 12
  const effectivePerMonth = Math.round(total / months)

  function handleContinue() {
    const query = new URLSearchParams({
      plan: plan.id,
      cycle,
      region,
      os: osImage,
    })
    if (email.trim()) query.set("email", email.trim())
    if (hostname.trim()) query.set("hostname", hostname.trim())
    router.push(`/checkout?${query.toString()}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CpuLogo brand={isRyzen ? "Ryzen" : "Intel"} className="h-7 sm:h-8" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {isRyzen ? "AMD Ryzen 9 9950X3D" : "Intel Xeon"}
                </p>
                <h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>
              </div>
            </div>
            <span className="glass rounded-full px-3 py-1 text-sm font-medium text-foreground">
              {formatINR(plan.priceINR)}
              <span className="text-muted-foreground">/mo</span>
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <FixedSpec icon={Cpu} label="CPU" value={`${plan.cpuCores} Cores`} />
            <FixedSpec icon={MemoryStick} label="RAM" value={`${plan.ramGB} GB`} />
            <FixedSpec icon={HardDrive} label="Storage" value="NVMe SSD" />
            <FixedSpec icon={Network} label="Network" value="High Speed" />
            <FixedSpec icon={ShieldCheck} label="Access" value="Full Root/Admin" />
            <FixedSpec icon={Globe} label="IP" value="IPv4 + IPv6" />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Plan specs are fixed for this tier. Need a different size?{" "}
            <a href="/pricing" className="text-accent hover:underline">
              Compare all plans
            </a>
            .
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Deployment
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <SelectField
              icon={Globe}
              label="Region"
              value={region}
              onChange={setRegion}
              options={[...deployRegions]}
            />
            <SelectField
              icon={MonitorCog}
              label="Operating system"
              value={osImage}
              onChange={setOsImage}
              options={[...osImages]}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="cfg-email" className="flex items-center gap-2 text-sm font-medium">
                <span className="text-accent">@</span>
                Email address
              </Label>
              <Input
                id="cfg-email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cfg-hostname" className="flex items-center gap-2 text-sm font-medium">
                <MonitorCog className="h-4 w-4 text-accent" />
                Hostname <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cfg-hostname"
                placeholder="irctc-desk-01"
                value={hostname}
                onChange={(event) => setHostname(event.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-accent" />
              Billing cycle
            </div>
            <RadioGroup
              value={cycle}
              onValueChange={(value) => setCycle(value as BillingCycle)}
              className="grid grid-cols-3 gap-2"
            >
              {cycles.map((option) => (
                <Label
                  key={option}
                  htmlFor={`cfg-cycle-${option}`}
                  className="glass flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm capitalize text-muted-foreground transition-colors hover:text-foreground has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:text-foreground"
                >
                  <RadioGroupItem id={`cfg-cycle-${option}`} value={option} className="sr-only" />
                  {option}
                  {option === "quarterly" && <span className="ml-1 text-xs text-accent">−5%</span>}
                  {option === "annual" && <span className="ml-1 text-xs text-accent">−17%</span>}
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass glass-strong flex flex-col rounded-2xl p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Order summary
          </h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">{formatINR(total)}</span>
            <span className="text-sm text-muted-foreground">
              /{cycle === "monthly" ? "mo" : cycle === "quarterly" ? "quarter" : "yr"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {billingCycleLabel[cycle]} · ≈ {formatINR(effectivePerMonth)}/mo effective
          </p>

          <dl className="mt-6 flex flex-col gap-3 pt-5 text-sm">
            <SummaryRow k="Plan" v={`${isRyzen ? "Ryzen" : "Intel"} · ${plan.name}`} />
            <SummaryRow k="CPU / RAM" v={`${plan.cpuCores} Cores · ${plan.ramGB} GB`} />
            <SummaryRow k="Region" v={region} />
            <SummaryRow k="OS" v={osImage} />
            <SummaryRow k="Billing" v={billingCycleLabel[cycle]} />
          </dl>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
            <span>Provisioned shortly after payment is confirmed.</span>
          </div>

          <Button onClick={handleContinue} className="mt-6 w-full gap-1.5">
            Continue to checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </div>
  )
}

function FixedSpec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-foreground/[0.035] p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-accent" />
        {label}
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  )
}

function SelectField({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof Cpu
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
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
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium text-foreground">{v}</dd>
    </div>
  )
}
