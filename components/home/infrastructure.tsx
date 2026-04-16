import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { Globe, Server, Network } from "lucide-react"

const regions = [
  { code: "BOM", city: "Mumbai, IN", status: "Live" },
  { code: "BLR", city: "Bengaluru, IN", status: "Live" },
  { code: "SIN", city: "Singapore", status: "Live" },
  { code: "FRA", city: "Frankfurt, DE", status: "Live" },
  { code: "NYC", city: "New York, US", status: "Live" },
  { code: "LON", city: "London, UK", status: "Coming soon" },
]

export function Infrastructure() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Infrastructure"
          title="A global footprint, built for low latency"
          description="Deploy close to your users and stay resilient with multi-region redundancy."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Stat
              icon={Globe}
              title="6 regions"
              desc="Across Asia, Europe, and North America."
            />
            <Stat
              icon={Server}
              title="Tier III+ facilities"
              desc="N+1 power, cooling, and network redundancy."
            />
            <Stat
              icon={Network}
              title="Private networking"
              desc="Low-latency interconnects between your nodes."
            />
          </div>

          <div className="glass-panel overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 text-left font-medium">Code</th>
                  <th className="px-5 py-3.5 text-left font-medium">Location</th>
                  <th className="px-5 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r) => (
                  <tr
                    key={r.code}
                    className="transition-colors hover:bg-accent/5"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {r.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{r.city}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          r.status === "Live"
                            ? "text-accent"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            r.status === "Live"
                              ? "bg-accent shadow-[0_0_8px_currentColor]"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Stat({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Globe
  title: string
  desc: string
}) {
  return (
    <div className="glass-card flex gap-4 rounded-2xl p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-accent shadow-[0_0_20px_-6px_currentColor]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
