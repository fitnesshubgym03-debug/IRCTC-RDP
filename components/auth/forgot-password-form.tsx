"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const err = validateEmail(email)
    setError(err)
    if (err) return

    setSubmitting(true)
    // Simulated request. Replace with POST /api/auth/forgot-password.
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <FormMessage tone="success" title="Reset link sent">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{email}</span>, a reset
          link is on its way. Check your inbox and spam folder.
        </FormMessage>
        <Button asChild variant="outline">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={error ? "true" : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setError(validateEmail(email))}
            aria-invalid={!!error}
            required
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={submitting} className="w-full gap-2">
        {submitting ? (
          <>
            <Spinner className="size-4" />
            Sending link
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  )
}
