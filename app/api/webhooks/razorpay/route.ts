import { NextResponse } from "next/server"
import { getOrderByRazorpayId, markOrderFailed, markOrderPaid } from "@/lib/orders"
import { verifyWebhookSignature } from "@/lib/payments"

export const runtime = "nodejs"

/**
 * Razorpay webhook receiver. Reconciles order status server-to-server so a
 * dropped browser callback (closed tab, lost network) still settles the order.
 * Configure the endpoint URL and PAYMENT_WEBHOOK_SECRET in the Razorpay dashboard.
 */
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  let event: {
    event?: string
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } }
  }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 })
  }

  const payment = event.payload?.payment?.entity
  const razorpayOrderId = payment?.order_id
  const paymentId = payment?.id

  if (!razorpayOrderId) {
    return NextResponse.json({ received: true })
  }

  const order = await getOrderByRazorpayId(razorpayOrderId)
  if (!order) {
    return NextResponse.json({ received: true })
  }

  if ((event.event === "payment.captured" || event.event === "order.paid") && paymentId) {
    await markOrderPaid(order.id, paymentId)
  } else if (event.event === "payment.failed") {
    await markOrderFailed(order.id)
  }

  return NextResponse.json({ received: true })
}
