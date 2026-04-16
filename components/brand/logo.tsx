import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  withText = true,
}: {
  className?: string
  withText?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-foreground",
        className
      )}
      aria-label="ZWS Cloud home"
    >
      <LogoMark className="h-7 w-7" />
      {withText && (
        <span className="text-base font-semibold tracking-tight">
          ZWS<span className="text-muted-foreground"> Cloud</span>
        </span>
      )}
    </Link>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <path
        d="M9 12h14l-9 8h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="12" r="1.5" className="fill-accent" />
    </svg>
  )
}
