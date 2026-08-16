"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { CpuLogo } from "@/components/plans/cpu-logo"
import {
  billingCycleLabel,
  deployRegions,
  formatINR,
  getPlanById,
  isBillingCycle,
  osImages,
  priceForCycle,
  plans,
  type BillingCycle,
} from "@/data/plans"

type RazorpayResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { email: string }
  notes: Record<string, string>
  theme: { color: string }
  handler: (response: RazorpayResponse) => void
  modal: { ondismiss: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false)
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function CheckoutClient() {
  const params = useSearchParams()
  const router = useRouter()

  const plan = getPlanById(params.get("plan")) ?? plans.find((item) => item.popular) ?? plans[0]
  const isRyzen = plan.platform === "AMD Ryzen 9 9950X3D"

  const cycleParam = params.get("cycle")
  const cycle: BillingCycle = isBillingCycle(cycleParam) ? cycleParam : "monthly"

  const regionParam = params.get("region")
  const region = deployRegions.includes(regionParam as (typeof deployRegions)[number])
    ? (regionParam as string)
    : deployRegions[0]

  const osParam = params.get("os")
  const osImage = osImages.includes(osParam as (typeof osImages)[number])
    ? (osParam as string)
    : osImages[0]

  const hostname = params.get("hostname") ?? ""

  const [email, setEmail] = useState(params.get("email") ?? "")
  const [submitting, setSubmitting] = useState(false)

  const total = useMemo(() => priceForCycle(plan, cycle), [plan, cycle])

  async function handlePay() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email", { description: "We need it to send your deployment details." })
      return
    }

    setSubmitting(true)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady) throw new Error("Could not load the payment SDK. Check your connection and retry.")

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: cycle,
          region,
          osImage,
          email: email.trim(),
          hostname,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.")

      if (!window.Razorpay) throw new Error("Payment SDK unavailable.")

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountInr * 100,
        currency: data.currency,
        name: "IRCTC RDP",
        description: `${data.orderId} · ${plan.name}`,
        order_id: data.razorpayOrderId,
        prefill: { email: email.trim() },
        notes: { orderId: data.orderId },
        theme: { color: "#00d492" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.status === "paid") {
              router.push(`/order/success?order=${data.orderId}`)
            } else {
              router.push(`/order/success?order=${data.orderId}`)
            }
          } catch {
            router.push(`/order/success?order=${data.orderId}`)
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
            router.push(`/order/success?order=${data.orderId}`)
          },
        },
      })
      rzp.open()
    } catch (error) {
      toast.error("Checkout failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
      setSubmitting(false)
    }
  }

  return (
    <Container className="grid max-w-5xl gap-8 py-16 sm:py-24 lg:grid-cols-[1fr_.8fr]">
      <div>
        <Link
          href={`/configure?plan=${plan.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to configuration
        </Link>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          CHECKOUT / SECURE PAYMENT
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Deploy {plan.name}.</h1>
        <p className="mt-4 text-muted-foreground">
          Pay securely with Razorpay (UPI, cards, netbanking, and wallets). Your server is provisioned
          once payment is confirmed.
        </p>

        <div className="glass mt-8 rounded-2xl p-6">
          <Label htmlFor="checkout-email" className="flex flex-col gap-2 text-sm">
            <span>Email address</span>
            <Input
              id="checkout-email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11"
            />
          </Label>

          <Button onClick={handlePay} disabled={submitting} className="mt-6 w-full gap-1.5">
            {submitting ? (
              <>
                <Spinner className="size-4" />
                Starting secure checkout
              </>
            ) : (
              <>
                Pay {formatINR(total)} with Razorpay
                <LockKeyhole className="size-4" />
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" />
            256-bit encrypted payment · powered by Razorpay
          </p>
        </div>
      </div>

      <aside className="glass h-fit rounded-2xl p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">ORDER SUMMARY</p>
        <div className="mt-4 flex items-center gap-2.5">
          <CpuLogo brand={isRyzen ? "Ryzen" : "Intel"} className="h-6" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {isRyzen ? "AMD Ryzen 9 9950X3D" : "Intel Xeon"}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {region} · {billingCycleLabel[cycle]}
        </p>
        <p className="mt-6 text-4xl font-semibold">{formatINR(total)}</p>
        <ul className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
          {[
            `${plan.cpuCores} CPU cores`,
            `${plan.ramGB} GB RAM`,
            "NVMe SSD storage",
            osImage,
            "Full root/administrator access",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </Container>
  )
}
