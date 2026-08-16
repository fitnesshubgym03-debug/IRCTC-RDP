import Link from "next/link"
import { cn } from "@/lib/utils"

const IRCTC_LOGO_SRC =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IRCTC_logo_PNG1-Ifdl4ScjnTSU4PskJgzU9yxL097lVC.png"

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
      className={cn("flex items-center gap-2 text-foreground", className)}
      aria-label="IRCTC RDP home"
    >
      <LogoMark />
      {withText && (
        <span className="text-base font-semibold tracking-tight">
          IRCTC<span className="text-muted-foreground"> RDP</span>
        </span>
      )}
    </Link>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={IRCTC_LOGO_SRC}
      alt="IRCTC"
      className={cn("h-8 w-10 object-contain object-center brightness-0 saturate-100", className)}
      style={{ filter: "brightness(0) saturate(100%) invert(18%) sepia(93%) saturate(5527%) hue-rotate(347deg) brightness(91%) contrast(111%)" }}
    />
  )
}
