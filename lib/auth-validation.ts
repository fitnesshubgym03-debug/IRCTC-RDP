/**
 * Frontend-only validation helpers for the ZWS Cloud auth UI.
 * -----------------------------------------------------------
 * These are intentionally simple and UI-focused. The backend
 * team should re-validate every field server-side using its
 * own schemas (zod / valibot / etc.).
 */

export type FieldError = string | null

export function validateEmail(email: string): FieldError {
  if (!email) return "Email is required."
  // Basic shape check. Backend will do definitive validation.
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  if (!ok) return "Enter a valid email address."
  return null
}

export function validatePhone(phone: string): FieldError {
  if (!phone) return "Phone number is required."
  // Accept +, digits, spaces, dashes, parens; require 7-15 digits total.
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 7 || digits.length > 15) {
    return "Phone number must be 7-15 digits."
  }
  return null
}

export function validateName(name: string): FieldError {
  if (!name.trim()) return "Name is required."
  if (name.trim().length < 2) return "Name must be at least 2 characters."
  return null
}

export function validateAddress(address: string): FieldError {
  if (!address.trim()) return "Address is required."
  if (address.trim().length < 6) return "Address looks too short."
  return null
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: "Too weak" | "Weak" | "Okay" | "Strong" | "Excellent"
  checks: {
    length: boolean
    lower: boolean
    upper: boolean
    number: boolean
    symbol: boolean
  }
}

export function evaluatePassword(pw: string): PasswordStrength {
  const checks = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  }
  const passed = Object.values(checks).filter(Boolean).length
  let score: 0 | 1 | 2 | 3 | 4 = 0
  if (pw.length === 0) score = 0
  else if (passed <= 2) score = 1
  else if (passed === 3) score = 2
  else if (passed === 4) score = 3
  else score = 4

  const label = (
    ["Too weak", "Weak", "Okay", "Strong", "Excellent"] as const
  )[score]

  return { score, label, checks }
}

export function validatePassword(pw: string): FieldError {
  if (!pw) return "Password is required."
  if (pw.length < 8) return "Password must be at least 8 characters."
  const { score } = evaluatePassword(pw)
  if (score < 2) return "Use a stronger mix of letters, numbers, and symbols."
  return null
}

export function validateMatch(
  a: string,
  b: string,
  label = "Passwords"
): FieldError {
  if (!b) return `Please confirm your ${label.toLowerCase()}.`
  if (a !== b) return `${label} do not match.`
  return null
}
