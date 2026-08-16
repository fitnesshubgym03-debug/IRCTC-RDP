import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { getOrder } from "@/lib/orders"

export const runtime = "nodejs"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 })
  }

  const order = await getOrder(id)
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  // Only return fields that are safe to expose to the browser.
  return NextResponse.json({
    id: order.id,
    planName: order.planName,
    platform: order.platform,
    region: order.region,
    osImage: order.osImage,
    hostname: order.hostname,
    billingCycle: order.billingCycle,
    amountInr: order.amountInr,
    currency: order.currency,
    email: order.email,
    status: order.status,
    createdAt: order.createdAt,
  })
}
