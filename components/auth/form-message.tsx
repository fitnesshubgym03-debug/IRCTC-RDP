import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "error" | "success" | "info"

export function FormMessage({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const Icon =
    tone === "error"
      ? AlertCircle
      : tone === "success"
      ? CheckCircle2
      : Info

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "error" &&
          "border-destructive/40 bg-destructive/10 text-destructive",
        tone === "success" &&
          "border-accent/40 bg-accent/10 text-foreground",
        tone === "info" &&
          "border-border/70 bg-card/50 text-muted-foreground",
        className
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          tone === "error" && "text-destructive",
          tone === "success" && "text-accent",
          tone === "info" && "text-muted-foreground"
        )}
      />
      <div className="flex flex-col gap-0.5">
        {title && <div className="font-medium text-foreground">{title}</div>}
        <div className="text-pretty leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
