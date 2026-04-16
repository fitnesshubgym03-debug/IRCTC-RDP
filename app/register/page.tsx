import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Sign up for ZWS Cloud.",
}

export default function RegisterPage() {
  return (
    <SiteShell>
      <Container className="py-20 sm:py-28">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo withText={false} className="h-9 w-9" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Deploy your first VPS in under a minute.
            </p>
          </div>

          <form className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            <FieldGroup>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <Input id="firstName" autoComplete="given-name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <Input id="lastName" autoComplete="family-name" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" autoComplete="new-password" minLength={8} required />
                <FieldDescription>Use at least 8 characters.</FieldDescription>
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full">
              Create account
            </Button>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </FieldDescription>
          </form>

          <p className="text-center text-xs text-muted-foreground text-balance">
            By creating an account you agree to our{" "}
            <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </Container>
    </SiteShell>
  )
}
