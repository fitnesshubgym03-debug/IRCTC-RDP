import { NextResponse } from "next/server"
import { z } from "zod"
import { getOrder, markOrderFailed, markOrderPaid } from "@/lib/orders"
import { verifyPaymentSignature } from "@/lib/payments"

export const runtime = "nodejs"

const bodySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  signature: z.string().min(1),
})

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = parsed.data

  const order = await getOrder(orderId)
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }
  // The Razorpay order id in the callback must match the one we stored.
  if (order.razorpayOrderId !== razorpayOrderId) {
    await markOrderFailed(orderId)
    return NextResponse.json({ status: "failed", error: "Order mismatch." }, { status: 400 })
  }

  const valid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })
  if (!valid) {
    await markOrderFailed(orderId)
    return NextResponse.json({ status: "failed", error: "Signature verification failed." }, { status: 400 })
  }

  await markOrderPaid(orderId, razorpayPaymentId)
  return NextResponse.json({ status: "paid", orderId })
}
