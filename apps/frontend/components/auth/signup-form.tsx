"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { PasswordStrengthMeter } from "@/components/auth/password-strength"
import { isValidEmail, isValidPhone, scorePassword } from "@/lib/auth-validation"
import { api } from "@/lib/api-client"

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; field?: keyof Values }
  | { status: "success" }

type Values = {
  name: string
  email: string
  phone: string
  address: string
  password: string
  confirm: string
}

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirm: "",
}
export function SignupForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<FormState>({ status: "idle" })

  const errors = useMemo(() => validate(values), [values])
  const hasErrors = Object.keys(errors).length > 0

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function blur(key: keyof Values) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Mark all fields touched so their errors surface.
    setTouched({
      name: true,
      email: true,
      phone: true,
      address: true,
      password: true,
      confirm: true,
    })
    if (hasErrors) return

    setState({ status: "submitting" })
    try {
      await api.register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        password,
      })
      setState({ status: "success" })
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        setState({
          status: "error",
          field: "email",
          message: error.message,
        })
        setTouched((t) => ({ ...t, email: true }))
      } else {
        setState({
          status: "error",
          message:
            error instanceof Error && error.message
              ? error.message
              : "Could not create your account. Please try again.",
        })
      }
    }
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="glass accent-glow relative flex h-12 w-12 items-center justify-center rounded-full text-accent">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Account created</h2>
        <p className="text-sm text-muted-foreground text-balance">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{values.email}</span>.
          Click it to finish setting up your IRCTC RDP account.
        </p>
        <Button asChild className="mt-2 w-full">
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {state.status === "error" && !state.field && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <FieldGroup>
        <Field data-invalid={shouldShow(touched.name, errors.name) || undefined}>
          <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
          <Input
            id="signup-name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={shouldShow(touched.name, errors.name)}
            required
          />
          {shouldShow(touched.name, errors.name) && (
            <FieldError>{errors.name}</FieldError>
          )}
        </Field>

        <Field
          data-invalid={
            shouldShow(touched.email, errors.email) ||
            (state.status === "error" && state.field === "email") ||
            undefined
          }
        >
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={shouldShow(touched.email, errors.email)}
            required
          />
          {shouldShow(touched.email, errors.email) && (
            <FieldError>{errors.email}</FieldError>
          )}
          {state.status === "error" && state.field === "email" && (
            <FieldError>{state.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={shouldShow(touched.phone, errors.phone) || undefined}>
          <FieldLabel htmlFor="signup-phone">Phone</FieldLabel>
          <Input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={shouldShow(touched.phone, errors.phone)}
            required
          />
          {shouldShow(touched.phone, errors.phone) && (
            <FieldError>{errors.phone}</FieldError>
          )}
        </Field>

        <Field data-invalid={shouldShow(touched.address, errors.address) || undefined}>
          <FieldLabel htmlFor="signup-address">Address</FieldLabel>
          <Textarea
            id="signup-address"
            autoComplete="street-address"
            rows={2}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            onBlur={() => blur("address")}
            aria-invalid={shouldShow(touched.address, errors.address)}
            required
          />
          {shouldShow(touched.address, errors.address) && (
            <FieldError>{errors.address}</FieldError>
          )}
        </Field>

        <Field data-invalid={shouldShow(touched.password, errors.password) || undefined}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => blur("password")}
              aria-invalid={shouldShow(touched.password, errors.password)}
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
          <PasswordStrengthMeter password={values.password} />
          {shouldShow(touched.password, errors.password) && (
            <FieldError>{errors.password}</FieldError>
          )}
        </Field>

        <Field data-invalid={shouldShow(touched.confirm, errors.confirm) || undefined}>
          <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
          <Input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={values.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            onBlur={() => blur("confirm")}
            aria-invalid={shouldShow(touched.confirm, errors.confirm)}
            required
          />
          {shouldShow(touched.confirm, errors.confirm) && (
            <FieldError>{errors.confirm}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full gap-1.5"
        disabled={state.status === "submitting"}
      >
        {state.status === "submitting" ? (
          <>
            <Spinner className="size-4" />
            Creating account
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <FieldDescription className="text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </FieldDescription>
    </form>
  )
}

function shouldShow(touched: boolean | undefined, error: string | undefined) {
  return Boolean(touched && error)
}

function validate(v: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (v.name.trim().length < 2) errors.name = "Enter your full name."
  if (!v.email) errors.email = "Email is required."
  else if (!isValidEmail(v.email)) errors.email = "Enter a valid email address."
  if (!v.phone) errors.phone = "Phone number is required."
  else if (!isValidPhone(v.phone))
    errors.phone = "Enter a valid phone number (8–16 digits)."
  if (v.address.trim().length < 6)
    errors.address = "Enter a complete street address."
  if (!v.password) errors.password = "Password is required."
  else if (scorePassword(v.password).score < 2)
    errors.password = "Use at least 8 characters with a mix of letters and numbers."
  if (!v.confirm) errors.confirm = "Confirm your password."
  else if (v.password && v.confirm !== v.password)
    errors.confirm = "Passwords don't match."
  return errors
}
