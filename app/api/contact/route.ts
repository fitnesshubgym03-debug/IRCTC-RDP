import { NextResponse } from "next/server"

/**
 * Contact form submission endpoint.
 *
 * This is a template handler: it validates the payload and logs it.
 * Wire it up to your delivery backend (email provider, CRM, Slack
 * webhook, database, etc.) before deploying to production.
 */

type ContactPayload = {
  name?: string
  email?: string
  company?: string
  phone?: string
  message?: string
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

export async function POST(request: Request) {
  let body: ContactPayload
  try {
    body = (await request.json()) as ContactPayload
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    )
  }

  const name = (body.name ?? "").trim()
  const email = (body.email ?? "").trim()
  const message = (body.message ?? "").trim()
  const company = (body.company ?? "").trim().slice(0, 200)
  const phone = (body.phone ?? "").trim().slice(0, 50)

  const errors: Record<string, string> = {}
  if (!name) errors.name = "Name is required."
  if (!email || !isEmail(email)) errors.email = "A valid email is required."
  if (message.length < 10) errors.message = "Message is too short."

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  // TODO: forward to email provider / CRM / DB.
  console.log("[v0] Contact submission:", {
    name,
    email,
    company,
    phone,
    messagePreview: message.slice(0, 120),
  })

  return NextResponse.json({ ok: true }, { status: 200 })
}
