import { NextResponse } from "next/server"
import { z } from "zod"
import {
  deployRegions,
  getPlanById,
  isBillingCycle,
  osImages,
  priceForCycle,
  type BillingCycle,
} from "@/data/plans"
import { isDbConfigured } from "@/lib/db"
import { createOrder, generateOrderId } from "@/lib/orders"
import { createRazorpayOrder, getPublicKeyId, isPaymentsConfigured } from "@/lib/payments"

export const runtime = "nodejs"

const bodySchema = z.object({
  planId: z.string().min(1),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]),
  region: z.enum(deployRegions),
  osImage: z.enum(osImages),
  email: z.string().email(),
  hostname: z
    .string()
    .trim()
    .max(63)
    .regex(/^[a-zA-Z0-9-]*$/, "Hostname may only contain letters, numbers, and hyphens.")
    .optional()
    .or(z.literal("")),
})

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Order storage is not configured. Add MYSQL_URL to enable checkout." },
      { status: 503 },
    )
  }
  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured. Add PAYMENT_KEY_ID and PAYMENT_KEY_SECRET." },
      { status: 503 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    )
  }

  const { planId, billingCycle, region, osImage, email, hostname } = parsed.data

  // Never trust a client-supplied price. Resolve the plan and recompute the total.
  const plan = getPlanById(planId)
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 })
  }
  if (!isBillingCycle(billingCycle)) {
    return NextResponse.json({ error: "Invalid billing cycle." }, { status: 400 })
  }

  const amountInr = priceForCycle(plan, billingCycle as BillingCycle)

  const orderId = generateOrderId()

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountInr,
      receipt: orderId,
      notes: { orderId, planId, email },
    })

    await createOrder({
      id: orderId,
      planId: plan.id,
      planName: `${plan.platform === "Intel" ? "Intel Xeon" : "AMD Ryzen 9 9950X3D"} · ${plan.name}`,
      platform: plan.platform,
      region,
      osImage,
      hostname: hostname && hostname.length > 0 ? hostname : null,
      billingCycle,
      amountInr,
      email,
      razorpayOrderId: razorpayOrder.id,
    })

    return NextResponse.json({
      orderId,
      amountInr,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      keyId: getPublicKeyId(),
    })
  } catch (error) {
    console.log("[v0] create order failed:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Could not create the order. Please try again." }, { status: 500 })
  }
}
