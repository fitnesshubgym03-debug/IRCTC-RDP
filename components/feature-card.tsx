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
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20",
        className
      )}
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-accent">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
