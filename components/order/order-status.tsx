"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { CheckCircle2, Clock3, ExternalLink, RefreshCw, XCircle } from "lucide-react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/data/plans"

type OrderResponse = {
  id: string
  planName: string
  region: string
  osImage: string
  hostname: string | null
  billingCycle: string
  amountInr: number
  email: string
  status: "pending" | "paid" | "failed"
  createdAt: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function OrderStatus({ orderId }: { orderId: string }) {
  const [tries, setTries] = useState(0)

  const { data, error, isLoading, mutate } = useSWR<OrderResponse>(
    `/api/orders/${orderId}`,
    fetcher,
    {
      // Poll while the order is still pending; a webhook may settle it shortly.
      refreshInterval: (latest) => (latest?.status === "pending" && tries < 12 ? 3000 : 0),
    },
  )

  useEffect(() => {
    if (data?.status === "pending") setTries((value) => value + 1)
  }, [data])

  if (isLoading) {
    return <Shell>Loading order…</Shell>
  }

  if (error || !data || data.error || !data.status) {
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

  const statusMap = {
    paid: {
      icon: CheckCircle2,
      tone: "accent" as const,
      title: "Payment successful",
      subtitle: "Your order is confirmed and provisioning has started.",
      badge: "Paid",
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
  }[data.status]

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
            <h2 className="font-mono font-semibold">#{data.id}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.planName} · {data.region}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-semibold">{formatINR(data.amountInr)}</p>
            <p
              className={
                data.status === "paid"
                  ? "text-sm text-accent"
                  : data.status === "failed"
                    ? "text-sm text-destructive"
                    : "text-sm text-amber-300"
              }
            >
              {statusMap.badge}
            </p>
          </div>
        </div>

        <dl className="grid gap-px border-t border-border bg-border/60 sm:grid-cols-2">
          <Detail k="Operating system" v={data.osImage} />
          <Detail k="Billing cycle" v={data.billingCycle} />
          <Detail k="Email" v={data.email} />
          <Detail k="Hostname" v={data.hostname ?? "Auto-assigned"} />
        </dl>

        <div className="flex flex-wrap gap-3 border-t border-border bg-background/30 p-6">
          {data.status === "paid" && (
            <Button asChild>
              <Link href="/dashboard">
                Open dashboard <ExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          )}
          {data.status === "pending" && (
            <Button variant="outline" onClick={() => mutate()}>
              Refresh status <RefreshCw data-icon="inline-end" />
            </Button>
          )}
          {data.status === "failed" && (
            <Button asChild>
              <Link href="/pricing">Choose a plan and retry</Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link href="/orders">View all orders</Link>
          </Button>
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
