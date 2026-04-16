"use client"

import { Check, X } from "lucide-react"
import { evaluatePassword } from "@/lib/auth-validation"
import { cn } from "@/lib/utils"

const SEGMENT_COLOR = [
  "bg-border/40", // 0
  "bg-destructive/70", // 1
  "bg-amber-500/70", // 2
  "bg-accent/60", // 3
  "bg-accent", // 4
]

export function PasswordStrengthMeter({ value }: { value: string }) {
  const { score, label, checks } = evaluatePassword(value)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= score ? SEGMENT_COLOR[score] : "bg-border/30"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Strength</span>
        <span
          className={cn(
            "font-medium",
            score <= 1 && "text-destructive",
            score === 2 && "text-amber-500",
            score >= 3 && "text-accent"
          )}
        >
          {value ? label : "—"}
        </span>
      </div>
      <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Check label="8+ characters" ok={checks.length} />
        <Check label="Lowercase" ok={checks.lower} />
        <Check label="Uppercase" ok={checks.upper} />
        <Check label="Number" ok={checks.number} />
        <Check label="Symbol" ok={checks.symbol} />
      </ul>
    </div>
  )
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-1.5">
      {ok ? (
        <CheckIcon />
      ) : (
        <X className="h-3 w-3 text-muted-foreground/50" aria-hidden />
      )}
      <span className={ok ? "text-foreground" : ""}>{label}</span>
    </li>
  )
}

function CheckIcon() {
  return (
    <span className="text-accent" aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}
