import { Suspense } from "react"
import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { CheckoutClient } from "@/components/checkout/checkout-client"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely pay for your IRCTC RDP plan with Razorpay.",
}

export default function CheckoutPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <Container className="py-24 text-sm text-muted-foreground">Loading checkout…</Container>
        }
      >
        <CheckoutClient />
      </Suspense>
    </SiteShell>
  )
}
