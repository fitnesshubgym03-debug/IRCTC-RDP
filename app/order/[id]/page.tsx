import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { OrderStatus } from "@/components/order/order-status"

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false },
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <SiteShell>
      <OrderStatus orderId={id} />
    </SiteShell>
  )
}
