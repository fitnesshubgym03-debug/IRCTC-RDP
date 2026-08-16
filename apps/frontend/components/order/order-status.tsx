"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { CheckCircle2, Clock3, ExternalLink, RefreshCw, ServerCog, XCircle } from "lucide-react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/data/plans"
import { apiFetch, orderStatusToUi, osIdToLabel, regionIdToLabel, type Order } from "@/lib/api-client"

type UiStatus = "pending" | "paid" | "failed"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

export function OrderStatus({ orderId }: { orderId: string }) {
  const [tries, setTries] = useState(0)

  const { data, error, isLoading, mutate } = useSWR<{ order: Order }>(
    `${process.env.NEXT_PUBLIC_API_URL ?? ""}/v1/orders/${orderId}`,
    fetcher,
    {
      // Poll while the order is still pending; a webhook may settle it shortly.
      refreshInterval: (latest) =>
        latest?.order?.status === "PENDING_PAYMENT" && tries < 12 ? 3000 : 0,
    },
  )

  useEffect(() => {
    if (data?.order?.status === "PENDING_PAYMENT") setTries((value) => value + 1)
  }, [data])

  if (isLoading) {
    return <Shell>Loading order…</Shell>
  }

  if (error || !data?.order) {
    return (
      <Shell>
        <StatusHeader
          icon={XCircle}
          tone="muted"
          title="Order not found"
          subtitle={`We couldn't find order ${orderId}.`}
        />
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/pricing">Browse plans</Link>
          </Button>
        </div>
      </Shell>
    )
  }

  const order = data.order
  const status = orderStatusToUi(order.status)

  const statusMap = {
    paid: {
      icon: CheckCircle2,
      tone: "accent" as const,
      title: "Payment successful",
      subtitle: "Your order is confirmed and provisioning has started.",
      badge: order.status === "SUSPENDED" ? "Suspended" : "Paid",
    },
    pending: {
      icon: Clock3,
      tone: "amber" as const,
      title: "Payment pending",
      subtitle: "We're waiting for confirmation from the payment provider.",
      badge: "Pending",
    },
    failed: {
      icon: XCircle,
      tone: "destructive" as const,
      title: "Payment failed",
      subtitle: "Your payment didn't go through. You can try again.",
      badge: "Failed",
    },
  }[status]

  return (
    <Shell>
      <StatusHeader
        icon={statusMap.icon}
        tone={statusMap.tone}
        title={statusMap.title}
        subtitle={statusMap.subtitle}
      />

      <div className="glass mt-8 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-mono font-semibold">#{order.id}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.plan.name} · {regionIdToLabel(order.region)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-semibold">{formatINR(order.amountINR)}</p>
            <p
              className={
                status === "paid"
                  ? "text-sm text-accent"
                  : status === "failed"
                    ? "text-sm text-destructive"
                    : "text-sm text-amber-300"
              }
            >
              {statusMap.badge}
            </p>
          </div>
        </div>

        <dl className="grid gap-px border-t border-border bg-border/60 sm:grid-cols-2">
          <Detail k="Operating system" v={osIdToLabel(order.os)} />
          <Detail k="Billing cycle" v={order.billingCycle} />
          <Detail k="Deployment region" v={regionIdToLabel(order.region)} />
          <Detail k="Order ID" v={order.id} />
        </dl>

        <div className="flex flex-wrap gap-3 border-t border-border bg-background/30 p-6">
          {status === "paid" && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border bg-background/30 p-6">
              <div className="flex items-center gap-2 text-sm text-accent">
                <ServerCog className="size-4 animate-pulse" />
                Provisioning your RDP server…
              </div>
              <div className="ml-auto flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard">
                    Open dashboard <ExternalLink data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
          {status === "pending" && (
            <div className="flex flex-wrap gap-3 border-t border-border bg-background/30 p-6">
              <Button variant="outline" onClick={() => mutate()}>
                Check payment status <RefreshCw data-icon="inline-end" />
              </Button>
            </div>
          )}
          {status === "failed" && (
            <div className="flex flex-wrap gap-3 border-t border-border bg-background/30 p-6">
              <Button asChild>
                <Link href={`/checkout?plan=${order.planId}`}>Try payment again</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">Choose another plan</Link>
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-border bg-background/30 p-6">
            <Button asChild variant="ghost">
              <Link href="/orders">View all orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <Container className="max-w-3xl py-16 sm:py-24">{children}</Container>
}

function StatusHeader({
  icon: Icon,
  tone,
  title,
  subtitle,
}: {
  icon: typeof CheckCircle2
  tone: "accent" | "amber" | "destructive" | "muted"
  title: string
  subtitle: string
}) {
  const toneClass = {
    accent: "text-accent",
    amber: "text-amber-300",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  }[tone]
  return (
    <div className="flex flex-col items-start gap-4">
      <span className={`glass flex size-12 items-center justify-center rounded-full ${toneClass}`}>
        <Icon className="size-6" />
      </span>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-card/40 p-5">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-1.5 break-words font-medium text-foreground">{v}</dd>
    </div>
  )
}
