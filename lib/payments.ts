import "server-only"
import crypto from "node:crypto"
import Razorpay from "razorpay"

let client: Razorpay | null = null

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.PAYMENT_KEY_ID && process.env.PAYMENT_KEY_SECRET)
}

export function getPublicKeyId(): string {
  const keyId = process.env.PAYMENT_KEY_ID
  if (!keyId) throw new Error("PAYMENT_KEY_ID is not set.")
  return keyId
}

function getClient(): Razorpay {
  if (!process.env.PAYMENT_KEY_ID || !process.env.PAYMENT_KEY_SECRET) {
    throw new Error("Razorpay keys are not set. Add PAYMENT_KEY_ID and PAYMENT_KEY_SECRET.")
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.PAYMENT_KEY_ID,
      key_secret: process.env.PAYMENT_KEY_SECRET,
    })
  }
  return client
}

/** Creates a Razorpay order. `amountInr` is in rupees; Razorpay expects paise. */
export async function createRazorpayOrder(params: {
  amountInr: number
  receipt: string
  notes?: Record<string, string>
}): Promise<{ id: string }> {
  const order = await getClient().orders.create({
    amount: Math.round(params.amountInr * 100),
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  })
  return { id: order.id }
}

/** Verifies the checkout callback signature: HMAC_SHA256(order_id|payment_id). */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  signature: string
}): boolean {
  const secret = process.env.PAYMENT_KEY_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex")
  return timingSafeEqual(expected, params.signature)
}

/** Verifies a Razorpay webhook payload against PAYMENT_WEBHOOK_SECRET. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  return timingSafeEqual(expected, signature)
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}
