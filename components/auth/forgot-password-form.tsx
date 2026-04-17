'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { validateEmail } from '@/lib/auth-validation'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setLoading(true)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-accent/10 p-4">
          <p className="text-sm text-accent-foreground">
            Check your email for a password reset link. It may take a few minutes to arrive.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
