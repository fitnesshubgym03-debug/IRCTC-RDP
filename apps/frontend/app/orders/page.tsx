import Link from "next/link"
import { CheckCircle2, ExternalLink } from "lucide-react"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { formatINR, getPlanById } from "@/data/plans"

export const metadata = { title: "Orders" }

const samplePlan = getPlanById("intel-6c-16gb")!
const platformName = samplePlan.platform === "Intel" ? "Intel Xeon" : "AMD Ryzen 9 9950X3D"

export default function Page() {
  return (
    <SiteShell>
      <Container className="max-w-4xl py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          CLIENT AREA / ORDERS
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Order history.
        </h1>

        <div className="glass mt-10 overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-accent" />
                <h2 className="font-semibold">#IR-2026-0816-0042</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {platformName} · {samplePlan.name} · Mumbai · 16 Aug 2026
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl font-semibold">{formatINR(samplePlan.priceINR)}</p>
              <p className="text-sm text-accent">Provisioned</p>
            </div>
          </div>
          <div className="border-t border-border bg-background/30 p-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Open dashboard <ExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </SiteShell>
  )
}