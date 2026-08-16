'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { scorePassword } from '@/lib/auth-validation'
import { PasswordStrengthMeter } from './password-strength'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', general: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = { password: '', confirmPassword: '', general: '' }

    // Validate password
    const strength = scorePassword(password)
    if (strength.score < 2) {
      newErrors.password = strength.hints.length > 0
        ? `Add ${strength.hints.slice(0, 2).join(' and ')}.`
        : 'Choose a stronger password.'
    }

    // Validate confirmation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    if (Object.values(newErrors).some(e => e)) return

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
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>New Password</FieldLabel>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          {password && <PasswordStrengthMeter password={password} />}
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>Confirm Password</FieldLabel>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Know your password?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in instead
        </Link>
      </p>
    </form>
  )
}
