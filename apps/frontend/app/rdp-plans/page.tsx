import { SiteShell } from "@/components/layout/site-shell"
import { ProductHero, PlanGrid, TrustRail } from "@/components/irctc/product-ui"
export const metadata = { title: "RDP Plans" }
export default function Page() { return <SiteShell><ProductHero eyebrow="01 / RDP PLANS" title="A ready desk for every booking window." description="Deploy a fast, persistent Windows workspace in an India location. Pick a plan, connect over RDP, and keep your operational setup ready." /><PlanGrid /><TrustRail /></SiteShell> }
