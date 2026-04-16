"use client"

import Link from "next/link"
import { useMemo, useState, type FormEvent } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { FormMessage } from "@/components/auth/form-message"
import { PasswordStrengthMeter } from "@/components/auth/password-strength"
import {
  validateAddress,
  validateEmail,
  validateMatch,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/auth-validation"

type FormState = {
  name: string
  email: string
  phone: string
  address: string
  password: string
  confirm: string
}

type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirm: "",
}

export function RegisterForm() {
  const [data, setData] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  function validateAll(): Errors {
    return cleanErrors({
      name: validateName(data.name),
      email: validateEmail(data.email),
      phone: validatePhone(data.phone),
      address: validateAddress(data.address),
      password: validatePassword(data.password),
      confirm: validateMatch(data.password, data.confirm, "Passwords"),
    })
  }

  const canSubmit = useMemo(() => {
    // Enable button once every field has a value — per-field validation
    // still runs on submit.
    return Object.values(data).every((v) => v.trim().length > 0)
  }, [data])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const next = validateAll()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    // Simulated request. Replace with POST /api/auth/register.
    await new Promise((r) => setTimeout(r, 1100))

    // Mocked server rule: "taken@" email simulates a conflict.
    if (data.email.toLowerCase().startsWith("taken@")) {
      setSubmitting(false)
      setErrors((p) => ({
        ...p,
        email: "An account with this email already exists.",
      }))
      setFormError("An account with this email already exists.")
      return
    }

    setSubmitting(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <FormMessage tone="success" title="Account created (simulated)">
        Verification email was not actually sent. When the backend is wired up,
        the user will receive a confirmation link and be signed in to{" "}
        <Link href="/client-area" className="text-accent underline">
          the client area
        </Link>
        .
      </FormMessage>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <FormMessage tone="error">{formError}</FormMessage>}

      <FieldGroup>
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() =>
              setErrors((p) => ({ ...p, name: validateName(data.name) ?? undefined }))
            }
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() =>
              setErrors((p) => ({ ...p, email: validateEmail(data.email) ?? undefined }))
            }
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field data-invalid={errors.phone ? "true" : undefined}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98xxxxxxxx"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() =>
              setErrors((p) => ({ ...p, phone: validatePhone(data.phone) ?? undefined }))
            }
            aria-invalid={!!errors.phone}
            required
          />
          {errors.phone && <FieldError>{errors.phone}</FieldError>}
        </Field>

        <Field data-invalid={errors.address ? "true" : undefined}>
          <FieldLabel htmlFor="address">Billing address</FieldLabel>
          <Textarea
            id="address"
            rows={3}
            autoComplete="street-address"
            value={data.address}
            onChange={(e) => set("address", e.target.value)}
            onBlur={() =>
              setErrors((p) => ({
                ...p,
                address: validateAddress(data.address) ?? undefined,
              }))
            }
            aria-invalid={!!errors.address}
            required
          />
          {errors.address && <FieldError>{errors.address}</FieldError>}
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  password: validatePassword(data.password) ?? undefined,
                }))
              }
              aria-invalid={!!errors.password}
              minLength={8}
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
          <PasswordStrengthMeter value={data.password} />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field data-invalid={errors.confirm ? "true" : undefined}>
          <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
          <Input
            id="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={data.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            onBlur={() =>
              setErrors((p) => ({
                ...p,
                confirm:
                  validateMatch(data.password, data.confirm, "Passwords") ??
                  undefined,
              }))
            }
            aria-invalid={!!errors.confirm}
            minLength={8}
            required
          />
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="w-full gap-2"
      >
        {submitting ? (
          <>
            <Spinner className="size-4" />
            Creating account
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Tip: use <span className="font-mono text-foreground">taken@example.com</span>{" "}
        to preview the &ldquo;email already exists&rdquo; state.
      </p>
    </form>
  )
}

function cleanErrors(raw: Errors): Errors {
  const out: Errors = {}
  for (const [k, v] of Object.entries(raw)) {
    if (v) out[k as keyof FormState] = v
  }
  return out
}
