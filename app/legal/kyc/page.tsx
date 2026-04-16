import type { Metadata } from "next"
import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "KYC / Customer Verification Policy",
  description: "Template KYC / customer verification policy for ZWS Cloud.",
}

export default function KYCPage() {
  return (
    <LegalPageLayout title="KYC / Customer Verification Policy" lastUpdated="January 1, 2026">
      <LegalSection title="Purpose">
        <p>
          Customer verification helps us prevent fraud and abuse, and keeps the
          network healthy for all customers. We apply verification
          proportionate to risk.
        </p>
      </LegalSection>

      <LegalSection title="Information we may request">
        <LegalList
          items={[
            "Full legal name and billing address.",
            "Government-issued identification for individuals where risk signals warrant.",
            "Company registration details for business accounts.",
            "Confirmation of phone number and email.",
          ]}
        />
      </LegalSection>

      <LegalSection title="When verification may apply">
        <LegalList
          items={[
            "First-time VPS deployments for new accounts.",
            "Unusual order patterns or high-risk signals.",
            "Payment provider flags or chargeback history.",
            "Regulatory requirements in specific jurisdictions.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Handling of documents">
        <p>
          Verification documents are processed by authorized personnel, stored
          with appropriate safeguards, and retained only as long as required
          for compliance and fraud prevention.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You may request an update or deletion of verification documents,
          subject to legal retention requirements. For details, see our Privacy
          Policy.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
