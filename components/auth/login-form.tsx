"use client"

import Link from "next/link"
import { useState } from "react"
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { isValidEmail } from "@/lib/auth-validation"

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success" }

// NOTE (for Codex): when wiring up the real backend, replace the
// simulated delay + hardcoded credentials check with a POST to
// /api/auth/login and route on the response. The form already exposes
// all the state transitions (idle -> submitting -> success | error).
const DEMO_CREDENTIALS = {
  email: "demo@zws.cloud",
  password: "Password123!",
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [state, setState] = useState<FormState>({ status: "idle" })

  const emailError =
    touched.email && email.length > 0 && !isValidEmail(email)
      ? "Enter a valid email address."
      : touched.email && email.length === 0
        ? "Email is required."
        : undefined

  const passwordError =
    touched.password && password.length === 0
      ? "Password is required."
      : undefined

  const disabled =
    state.status === "submitting" ||
    !email ||
    !password ||
    !!emailError ||
    !!passwordError

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isValidEmail(email) || password.length === 0) return

    setState({ status: "submitting" })
    await new Promise((r) => setTimeout(r, 900))

    if (
      email.toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      setState({ status: "success" })
    } else {
      setState({
        status: "error",
        message: "Invalid email or password. Try demo@zws.cloud / Password123!",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {state.status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
      {state.status === "success" && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Signed in. Redirecting to your dashboard…</span>
        </div>
      )}

      <FieldGroup>
        <Field data-invalid={!!emailError || undefined}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={!!emailError}
            required
          />
          {emailError && <FieldError>{emailError}</FieldError>}
        </Field>

        <Field data-invalid={!!passwordError || undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!passwordError}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && <FieldError>{passwordError}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full gap-1.5" disabled={disabled}>
        {state.status === "submitting" ? (
          <>
            <Spinner className="size-4" />
            Signing in
          </>
        ) : (
          <>
            Log in
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <FieldDescription className="text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </FieldDescription>
    </form>
  )
}
