import { SiteShell } from "@/components/layout/site-shell"
import { ProductHero, LocationGrid, TrustRail } from "@/components/irctc/product-ui"
export const metadata = { title: "Locations" }
export default function Page() { return <SiteShell><ProductHero eyebrow="02 / NETWORK MAP" title="Pick the node closest to your workflow." description="Our India locations are positioned for stable routing, predictable latency, and a responsive remote desktop experience." /><LocationGrid /><TrustRail /></SiteShell> }
