import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your ZWS Cloud account.",
}

export default function LoginPage() {
  return (
    <SiteShell>
      <Container className="py-20 sm:py-28">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo withText={false} className="h-9 w-9" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Log in to your ZWS Cloud account.
            </p>
          </div>

          <form className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" required />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="#"
                    className="text-xs text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required />
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full">
              Log in
            </Button>

            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Create one
              </Link>
            </FieldDescription>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            This is a placeholder auth form. Authentication is not wired up yet.
          </p>
        </div>
      </Container>
    </SiteShell>
  )
}
