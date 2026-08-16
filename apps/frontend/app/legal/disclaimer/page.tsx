import type { Metadata } from "next"
import { LegalPageLayout, LegalSection } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Template disclaimer for IRCTC RDP.",
}

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Disclaimer" lastUpdated="January 1, 2026">
      <LegalSection title="Template content notice">
        <p>
          All content on this website, including pricing, service descriptions,
          and infrastructure details, is provided as illustrative template
          material. IRCTC RDP as presented here is a demonstration site; any
          specific figures, guarantees, certifications, or endorsements should
          be independently verified before relying on them commercially.
        </p>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          Information on this website is provided &ldquo;as is&rdquo; without warranty of
          any kind, express or implied. We do not warrant that information is
          accurate, complete, or current.
        </p>
      </LegalSection>

      <LegalSection title="External links">
        <p>
          Links to third-party sites are provided for convenience. We are not
          responsible for the content, accuracy, or practices of external sites.
        </p>
      </LegalSection>

      <LegalSection title="Legal advice">
        <p>
          Nothing on this website constitutes legal, tax, or professional
          advice. Consult qualified professionals for specific advice relating
          to your circumstances.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
