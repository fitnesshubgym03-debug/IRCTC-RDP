import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/brand/logo"
import { SiteShell } from "@/components/layout/site-shell"

type Props = {
  title: string
  description: string
  children: React.ReactNode
  /** Text + link shown under the form, e.g. "Already have an account? Log in" */
  footer?: React.ReactNode
  /** Shown below the footer in very small print, e.g. legal note. */
  legal?: React.ReactNode
}

export function AuthShell({ title, description, children, footer, legal }: Props) {
  return (
    <SiteShell>
      <Container className="py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Link href="/" aria-label="Home">
              <Logo withText={false} className="h-10 w-10" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          </div>

          <div className="glass-panel accent-glow relative rounded-2xl p-6 sm:p-8">
            {children}
          </div>

          {footer && (
            <p className="text-center text-sm text-muted-foreground">
              {footer}
            </p>
          )}

          {legal && (
            <p className="text-center text-xs text-muted-foreground text-balance">
              {legal}
            </p>
          )}
        </div>
      </Container>
    </SiteShell>
  )
}
