import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/brand/logo"

/**
 * Shared layout wrapper for all auth pages.
 * Keeps header/logo/title styling consistent and pushes the form into
 * a centered glass card that sits over the global dot field.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="relative mx-auto flex w-full max-w-md flex-col gap-8">
        {/* Ambient accent glow behind the card. */}
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--accent)_18%,transparent),transparent_70%)] blur-2xl" />

        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="glass inline-flex items-center justify-center rounded-xl p-2"
          >
            <Logo withText={false} className="h-7 w-7" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        </div>

        <div className="glass glass-strong accent-glow relative rounded-2xl p-6 sm:p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-xs text-muted-foreground text-balance">
            {footer}
          </p>
        )}
      </div>
    </Container>
  )
}
