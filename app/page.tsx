import { SiteShell } from "@/components/layout/site-shell"
import { Hero } from "@/components/home/hero"
import { TrustStrip } from "@/components/home/trust-strip"
import { PlansPreview } from "@/components/home/plans-preview"
import { ConfigPreview } from "@/components/home/config-preview"
import { Features } from "@/components/home/features"
import { WhyChoose } from "@/components/home/why-choose"
import { Infrastructure } from "@/components/home/infrastructure"
import { Testimonials } from "@/components/home/testimonials"
import { HomeFaq } from "@/components/home/home-faq"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <TrustStrip />
      <PlansPreview />
      <ConfigPreview />
      <Features />
      <WhyChoose />
      <Infrastructure />
      <Testimonials />
      <HomeFaq />
      <CTASection />
    </SiteShell>
  )
}
