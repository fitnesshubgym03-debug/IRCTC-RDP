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
import { PasswordStrengthMeter } from "@/components/auth/password-strength"
import { validateMatch, validatePassword } from "@/lib/auth-validation"

type Errors = { password?: string; confirm?: string }

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Errors = {}
    const pwErr = validatePassword(password)
    if (pwErr) next.password = pwErr
    const matchErr = validateMatch(password, confirm, "Passwords")
    if (matchErr) next.confirm = matchErr
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    // Simulated request. Replace with POST /api/auth/reset-password.
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <FormMessage tone="success" title="Password updated">
          Your password has been changed. You can now sign in with your new
          credentials.
        </FormMessage>
        <Button asChild>
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              className="pr-10"
              minLength={8}
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
          <PasswordStrengthMeter value={password} />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field data-invalid={errors.confirm ? "true" : undefined}>
          <FieldLabel htmlFor="confirm">Confirm new password</FieldLabel>
          <Input
            id="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!errors.confirm}
            minLength={8}
            required
          />
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={submitting} className="w-full gap-2">
        {submitting ? (
          <>
            <Spinner className="size-4" />
            Updating
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  )
}
