"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { FormMessage } from "@/components/auth/form-message"
import { validateEmail } from "@/lib/auth-validation"

type Errors = { email?: string; password?: string }

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function validate(): Errors {
    const next: Errors = {}
    const e = validateEmail(email)
    if (e) next.email = e
    if (!password) next.password = "Password is required."
    return next
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    // Simulated request. Replace with POST /api/auth/login.
    await new Promise((r) => setTimeout(r, 900))

    // Mocked server rule: any "error@" email surfaces invalid creds.
    if (email.toLowerCase().startsWith("error@")) {
      setSubmitting(false)
      setFormError("Email or password is incorrect.")
      return
    }

    setSubmitting(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <FormMessage tone="success" title="Signed in (simulated)">
        Backend auth is not wired up yet. When Codex connects it, this will
        redirect to{" "}
        <Link href="/client-area" className="text-accent underline">
          your dashboard
        </Link>
        .
      </FormMessage>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <FormMessage tone="error">{formError}</FormMessage>}

      <FieldGroup>
        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() =>
              setErrors((p) => ({ ...p, email: validateEmail(email) ?? undefined }))
            }
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={submitting} className="w-full gap-2">
        {submitting ? (
          <>
            <Spinner className="size-4" />
            Signing in
          </>
        ) : (
          "Log in"
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Tip: use <span className="font-mono text-foreground">error@example.com</span>{" "}
        to preview the invalid-credentials state.
      </p>
    </form>
  )
}
