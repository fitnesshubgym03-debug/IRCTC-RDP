import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"

export const metadata: Metadata = {
  title: "System Status",
  description: "Live status for ZWS Cloud regions and services.",
}

const services = [
  { name: "API", status: "Operational" },
  { name: "Compute (BOM)", status: "Operational" },
  { name: "Compute (BLR)", status: "Operational" },
  { name: "Compute (SIN)", status: "Operational" },
  { name: "Compute (FRA)", status: "Operational" },
  { name: "Compute (NYC)", status: "Operational" },
  { name: "Customer portal", status: "Operational" },
  { name: "Billing", status: "Operational" },
]

const incidents = [
  {
    date: "2025-10-11",
    title: "Elevated latency in FRA — investigating",
    severity: "Minor",
    status: "Resolved",
  },
  {
    date: "2025-09-02",
    title: "Scheduled maintenance — BOM network fabric",
    severity: "Maintenance",
    status: "Completed",
  },
]

export default function StatusPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Status"
        title="Live service status."
        description="This is a placeholder status page. Plug in your real monitoring provider before production launch."
      />

      <section className="py-16">
        <Container className="flex flex-col gap-10">
          <div className="glass accent-glow relative flex flex-col gap-3 overflow-hidden rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="status-pulse absolute inset-0 rounded-full bg-accent" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <h2 className="text-lg font-semibold">All systems operational</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Current 30-day uptime across regions: 99.993%.
            </p>
          </div>

          <div>
            <SectionHeader eyebrow="Services" title="Component status" />
            <ul className="glass mt-8 flex flex-col gap-1 rounded-2xl p-2">
              {services.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors hover:bg-foreground/[0.035]"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="inline-flex items-center gap-2 text-accent">
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="status-pulse absolute inset-0 rounded-full bg-accent" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeader eyebrow="History" title="Recent incidents" />
            <div className="mt-8 flex flex-col gap-3">
              {incidents.map((i) => (
                <div
                  key={i.date + i.title}
                  className="glass glass-hover flex flex-col gap-1 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.date} · {i.severity}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {i.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
