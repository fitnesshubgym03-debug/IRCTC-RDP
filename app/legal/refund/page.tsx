import type { Metadata } from "next"
import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Template refund and cancellation policy for IRCTC RDP.",
}

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" lastUpdated="January 1, 2026">
      <LegalSection title="Refund window">
        <p>
          New VPS orders are eligible for a refund within seven (7) calendar
          days of first provisioning, subject to the exclusions below.
        </p>
      </LegalSection>

      <LegalSection title="Exclusions">
        <LegalList
          items={[
            "Annual pre-payments after the initial refund window.",
            "Setup fees on custom or dedicated configurations.",
            "Usage-based fees such as bandwidth overages or add-on services.",
            "Accounts suspended or terminated for AUP violations.",
            "Domain registrations and third-party services resold through us.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Cancellations">
        <p>
          You may cancel services at any time through your client area or by
          contacting support. Cancellations take effect at the end of the
          current billing cycle unless stated otherwise.
        </p>
      </LegalSection>

      <LegalSection title="Processing">
        <p>
          Approved refunds are processed to the original payment method within
          5–10 business days. Processing times vary by payment provider.
        </p>
      </LegalSection>

      <LegalSection title="How to request a refund">
        <p>
          Email{" "}
          <a href="mailto:billing@irctcrdp.com">billing@irctcrdp.com</a>{" "}
          with your account email, invoice number, and the reason for the
          refund. We will respond with next steps.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
