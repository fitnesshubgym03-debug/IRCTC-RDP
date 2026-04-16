import { Activity, Headphones, ShieldCheck, Zap, Tag } from "lucide-react"
import { Container } from "@/components/layout/container"

const items = [
  { icon: Activity, label: "99.99% uptime SLA" },
  { icon: Headphones, label: "24/7 support" },
  { icon: ShieldCheck, label: "DDoS protection" },
  { icon: Zap, label: "< 60s deployment" },
  { icon: Tag, label: "Transparent pricing" },
]

export function TrustStrip() {
  return (
    <section className="border-b border-border/60 bg-card/30 py-8">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:justify-between">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
