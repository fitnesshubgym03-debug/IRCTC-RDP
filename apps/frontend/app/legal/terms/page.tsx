import type { Metadata } from "next"
import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Template terms of service for IRCTC RDP.",
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms and Conditions" lastUpdated="January 1, 2026">
      <LegalSection title="1. Agreement to terms">
        <p>
          These Terms govern your use of IRCTC RDP services. By creating an
          account or using any service, you agree to these Terms. If you are
          entering into these Terms on behalf of a company, you represent that
          you have authority to bind that company.
        </p>
      </LegalSection>

      <LegalSection title="2. Services">
        <p>
          IRCTC RDP provides virtual private servers, cloud hosting, and
          related infrastructure services. Service specifications are described
          on our product pages and may evolve over time.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account">
        <LegalList
          items={[
            "You are responsible for keeping credentials confidential.",
            "You must provide accurate information and keep it up to date.",
            "You are responsible for activity that occurs under your account.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>
          Your use of the services is subject to our Acceptable Use Policy
          (AUP). Violations may result in suspension or termination of affected
          services.
        </p>
      </LegalSection>

      <LegalSection title="5. Fees and billing">
        <LegalList
          items={[
            "Fees are billed on the cycle you select (monthly, quarterly, or annual).",
            "Taxes may apply based on your jurisdiction.",
            "Invoices are available through your client area.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Refunds">
        <p>
          Refunds are governed by our Refund Policy. Certain add-ons, annual
          pre-payments, and usage-based fees may be non-refundable.
        </p>
      </LegalSection>

      <LegalSection title="7. Service levels">
        <p>
          Service availability commitments are described in our Service Level
          Agreement (SLA). Credits, where applicable, are the sole remedy for
          covered availability issues.
        </p>
      </LegalSection>

      <LegalSection title="8. Confidentiality & data">
        <p>
          We handle your data in accordance with our Privacy Policy. You are
          responsible for the lawfulness of data you store on the services.
        </p>
      </LegalSection>

      <LegalSection title="9. Suspension and termination">
        <p>
          We may suspend or terminate access for non-payment, violations of
          these Terms, or activity that endangers our platform or other
          customers. You may terminate services at any time.
        </p>
      </LegalSection>

      <LegalSection title="10. Warranty disclaimer">
        <p>
          Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the
          fullest extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>
          To the maximum extent permitted by law, liability is limited to the
          fees paid to us for the affected service during the twelve (12)
          months preceding the event giving rise to the claim.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to the terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated through reasonable means such as email or in-product
          notices.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms may be sent to{" "}
          <a href="mailto:legal@irctcrdp.com">legal@irctcrdp.com</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
