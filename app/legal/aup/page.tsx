import type { Metadata } from "next"
import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Template Acceptable Use Policy for ZWS Cloud.",
}

export default function AUPPage() {
  return (
    <LegalPageLayout title="Acceptable Use Policy" lastUpdated="January 1, 2026">
      <LegalSection title="Scope">
        <p>
          This Acceptable Use Policy (AUP) applies to all customers and end
          users of ZWS Cloud services. Violations may result in suspension or
          termination of affected services.
        </p>
      </LegalSection>

      <LegalSection title="Prohibited content">
        <LegalList
          items={[
            "Content that is illegal under applicable law.",
            "Child sexual abuse material (CSAM) — reported immediately to authorities.",
            "Content that infringes intellectual property rights.",
            "Content that promotes violence, hate, or discrimination.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Prohibited activities">
        <LegalList
          items={[
            "Sending unsolicited bulk email (spam).",
            "Phishing, fraud, or impersonation.",
            "Distributing malware, ransomware, or botnet command-and-control.",
            "Performing unauthorized security testing against third parties.",
            "Operating open resolvers or public NTP/DNS amplifiers.",
            "Deliberate denial-of-service against any target.",
            "Cryptocurrency mining on shared/unsupported plans.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Network etiquette">
        <LegalList
          items={[
            "Respond promptly to abuse reports from our team.",
            "Keep software and credentials reasonably secure.",
            "Do not attempt to circumvent platform limits.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Enforcement">
        <p>
          Our response scales with severity. Minor issues typically receive a
          warning and remediation window; severe issues may be suspended
          immediately. Appeals may be submitted via support.
        </p>
      </LegalSection>

      <LegalSection title="Reporting abuse">
        <p>
          Report abuse to{" "}
          <a href="mailto:abuse@zwscloud.example">abuse@zwscloud.example</a>. See
          also our Abuse Reporting & Data Retention page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
