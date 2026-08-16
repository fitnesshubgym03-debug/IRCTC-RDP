/**
 * Frontend-only validation helpers for auth forms.
 *
 * These are UI-layer checks — the real backend (Codex) MUST revalidate
 * every field server-side. Shared strings are exported so the same copy
 * is used across login / signup / reset-password screens.
 */

export const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Accepts international formats: optional leading +, digits, spaces,
// dashes, and parentheses. 8–16 digits total after stripping noise.
export const PHONE_REGEX = /^\+?[0-9\s()\-]{8,20}$/

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim())
}

export function isValidPhone(value: string) {
  const trimmed = value.trim()
  if (!PHONE_REGEX.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, "")
  return digits.length >= 8 && digits.length <= 16
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong"
  hints: string[]
}

/**
 * Scores a password on a 0–4 scale. Mirrors common UX guidance:
 * length is the single biggest lever, then character-class variety.
 */
export function scorePassword(pw: string): PasswordStrength {
  const hints: string[] = []
  if (pw.length < 8) hints.push("At least 8 characters")
  if (!/[A-Z]/.test(pw)) hints.push("An uppercase letter")
  if (!/[a-z]/.test(pw)) hints.push("A lowercase letter")
  if (!/[0-9]/.test(pw)) hints.push("A number")
  if (!/[^A-Za-z0-9]/.test(pw)) hints.push("A symbol (e.g. !@#)")

  if (pw.length < 8) return { score: 0, label: "Too short", hints }

  let classes = 0
  if (/[A-Z]/.test(pw)) classes++
  if (/[a-z]/.test(pw)) classes++
  if (/[0-9]/.test(pw)) classes++
  if (/[^A-Za-z0-9]/.test(pw)) classes++

  // Base on classes, bump with length.
  let score: 0 | 1 | 2 | 3 | 4 = 1
  if (classes >= 2) score = 2
  if (classes >= 3 && pw.length >= 10) score = 3
  if (classes === 4 && pw.length >= 12) score = 4

  const label: PasswordStrength["label"] =
    score === 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong"

  return { score, label, hints }
}
