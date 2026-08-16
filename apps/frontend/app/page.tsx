import { SiteShell } from "@/components/layout/site-shell"
import { IrctcHome } from "@/components/home/irctc-home"

export const metadata = { title: "Fast Remote Booking Infrastructure" }

export default function HomePage() {
  return <SiteShell><IrctcHome /></SiteShell>
}
