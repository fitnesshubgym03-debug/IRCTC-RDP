import Link from "next/link"
import { ArrowRight, Check, Cpu, HardDrive, Network, ShieldCheck, WalletCards } from "lucide-react"
import type { Plan } from "@/data/plans"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PlanCard({
  plan,
  currency = "INR",
  ctaHref,
}: {
  plan: Plan
  currency?: "INR" | "USD"
  ctaHref?: string
}) {
  const price = currency === "INR" ? plan.priceINR : plan.priceUSD
  const symbol = currency === "INR" ? "₹" : "$"
  const isRyzen = plan.platform === "AMD Ryzen 9 9950X3D"

  return (
    <div
      className={cn(
        "glass glass-hover relative flex flex-col rounded-2xl p-5 sm:p-6",
        isRyzen && "border-amber-300/20 bg-amber-300/[0.025]",
        (plan.popular || plan.bestValue) && "accent-glow ring-1 ring-accent/30"
      )}
    >
      {(plan.bestValue || plan.popular) && (
        <div className="absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-foreground shadow-lg shadow-accent/25">
          {plan.bestValue ? "Best value" : "Popular"}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {isRyzen ? <Cpu className="size-3.5 text-amber-300" /> : <Cpu className="size-3.5 text-accent" />}
        {plan.platform}
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{plan.name}</h3>
      <p className="mt-1 min-h-10 text-sm leading-6 text-muted-foreground">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">
          {symbol}{price.toLocaleString("en-IN")}
        </span>
        <span className="text-sm text-muted-foreground">/mo</span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-foreground/[0.035] p-4 text-sm">
        <Spec icon={Cpu} label="CPU" value={`${plan.cpuCores} Cores`} />
        <Spec icon={WalletCards} label="RAM" value={`${plan.ramGB} GB`} />
        <Spec icon={HardDrive} label="Storage" value="NVMe SSD" />
        <Spec icon={Network} label="Network" value="High Speed" />
        <Spec icon={ShieldCheck} label="Access" value="Full Root/Admin" />
      </dl>

      <ul className="mt-5 flex flex-col gap-2 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant={plan.popular || plan.bestValue ? "default" : "outline"} className="mt-7 w-full gap-1.5">
        <Link href={ctaHref ?? `/configure?plan=${plan.id}`}>
          Deploy now <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 text-accent" />
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
