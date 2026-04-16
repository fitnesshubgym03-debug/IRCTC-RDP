import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
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

  return (
    <div
      className={cn(
        "glass-card relative flex flex-col rounded-2xl p-6",
        plan.popular && "glass-card-accent"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground shadow-[0_0_20px_-4px_currentColor]">
          Most popular
        </div>
      )}

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">
          {symbol}
          {price.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">/mo</span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-background/30 p-4 text-sm backdrop-blur-sm">
        <Spec label="vCPU" value={plan.vcpu.toString()} />
        <Spec label="RAM" value={`${plan.ramGB} GB`} />
        <Spec label="Storage" value={`${plan.storageGB} GB NVMe`} />
        <Spec label="Bandwidth" value={`${plan.bandwidthTB} TB`} />
      </dl>

      <ul className="mt-5 flex flex-col gap-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-2">
        <Button
          asChild
          variant={plan.popular ? "default" : "outline"}
          className="w-full gap-1.5"
        >
          <Link href={ctaHref ?? `/configure?plan=${plan.id}`}>
            Deploy {plan.name.replace(" VPS", "")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  )
}
