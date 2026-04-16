import type { Metadata } from "next"
import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Service Level Agreement",
  description: "Template SLA for ZWS Cloud.",
}

export default function SLAPage() {
  return (
    <LegalPageLayout title="Service Level Agreement" lastUpdated="January 1, 2026">
      <LegalSection title="Availability commitment">
        <p>
          We target 99.99% monthly availability for covered compute services.
          Availability is calculated per service per calendar month, excluding
          planned maintenance communicated in advance.
        </p>
      </LegalSection>

      <LegalSection title="Service credits">
        <p>
          If monthly availability falls below the target, customers may be
          eligible for service credits applied to future invoices. Credit
          amounts scale with the severity and duration of the incident.
        </p>
        <LegalList
          items={[
            "99.90% – 99.99%: 5% credit of monthly fees for the affected service.",
            "99.00% – 99.89%: 10% credit.",
            "Below 99.00%: 25% credit.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Exclusions">
        <LegalList
          items={[
            "Scheduled maintenance windows notified in advance.",
            "Force majeure events outside our reasonable control.",
            "Customer-initiated actions (misconfiguration, quota limits, abuse).",
            "Third-party network issues outside our infrastructure.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Support response targets">
        <LegalList
          items={[
            "Starter: First response within 6 hours for priority tickets.",
            "Business: First response within 2 hours for priority tickets.",
            "Pro: First response within 1 hour for priority tickets.",
            "Enterprise: First response within 15 minutes, 24/7.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Claiming a credit">
        <p>
          Credits must be requested within 30 days of the incident by emailing{" "}
          <a href="mailto:billing@zwscloud.example">billing@zwscloud.example</a>{" "}
          with the affected service identifier and incident timeframe.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
