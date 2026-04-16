import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "group glass-card relative flex flex-col gap-3 rounded-xl p-6",
        className
      )}
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-accent shadow-[0_0_20px_-6px_color-mix(in_oklch,var(--accent)_50%,transparent)] transition-all duration-300 group-hover:border-accent/60 group-hover:text-accent group-hover:shadow-[0_0_30px_-4px_color-mix(in_oklch,var(--accent)_60%,transparent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
