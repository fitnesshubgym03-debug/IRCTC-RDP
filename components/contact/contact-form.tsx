"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

type FormState = {
  name: string
  email: string
  company: string
  phone: string
  message: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = "Please enter your name."
    if (!form.email.trim()) next.email = "Please enter a valid email."
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "That email doesn't look right."
    if (!form.message.trim() || form.message.trim().length < 10)
      next.message = "Tell us a bit more — at least 10 characters."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Request failed")
      toast.success("Message sent", {
        description: "We'll get back to you within one business day.",
      })
      setForm({ name: "", email: "", company: "", phone: "", message: "" })
    } catch {
      toast.error("Unable to send message", {
        description: "Please try again or email hello@zwscloud.example.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">Work email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="company">Company</FieldLabel>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Company name (optional)"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 00000 00000 (optional)"
            />
          </Field>
        </div>

        <Field data-invalid={errors.message ? true : undefined}>
          <FieldLabel htmlFor="message">How can we help?</FieldLabel>
          <Textarea
            id="message"
            rows={6}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Tell us a bit about your workload, timelines, or questions."
            aria-invalid={!!errors.message}
          />
          {errors.message && <FieldError>{errors.message}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          By submitting, you agree to our Privacy Policy.
        </p>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Sending
            </>
          ) : (
            <>
              Send message
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
