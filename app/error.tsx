"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Route error:", error)
  }, [error])

  return (
    <main className="flex min-h-[80vh] items-center">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-destructive">
            Unexpected error
          </p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Something broke on our side.
          </h1>
          <p className="mt-5 text-pretty text-muted-foreground">
            We&apos;ve logged the issue. You can retry the action or return
            home. If it keeps happening, please contact support.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Ref: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={reset} size="lg" className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
