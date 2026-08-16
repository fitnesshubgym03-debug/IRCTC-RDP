import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { OrderStatus } from "@/components/order/order-status"

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false },
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams
  if (!order) {
    return (
      <SiteShell>
        <Container className="py-24 text-sm text-muted-foreground">
          No order specified. Check the link you were sent or visit{" "}
          <a href="/orders" className="text-accent hover:underline">
            your orders
          </a>
          .
        </Container>
      </SiteShell>
    )
  }
  return (
    <SiteShell>
      <OrderStatus orderId={order} />
    </SiteShell>
  )
}