import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/data/site"
import { ShieldAlert, Clock, FileText, Gavel } from "lucide-react"

export const metadata: Metadata = {
  title: "Abuse Reporting & Data Retention",
  description:
    "How to report abuse on the ZWS Cloud network and our data retention practices.",
}

const items = [
  {
    icon: ShieldAlert,
    title: "Report abuse",
    desc: `Email our abuse team at ${siteConfig.contact.abuse} with source IPs, timestamps (UTC), log excerpts, and any relevant evidence.`,
  },
  {
    icon: Clock,
    title: "Response targets",
    desc: "Acknowledgement within 24 hours. Investigation status updates within 72 hours. Most reports are actioned within 5 business days.",
  },
  {
    icon: FileText,
    title: "Data retention",
    desc: "Operational logs are retained up to 30 days. Billing records are retained as required by applicable tax and financial regulations.",
  },
  {
    icon: Gavel,
    title: "Law enforcement",
    desc: "Formal requests must be submitted in writing through lawful channels. We comply with valid legal process and notify customers where permitted.",
  },
]

export default function AbusePage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Policy"
        title="Abuse reporting & data retention."
        description="We take abuse seriously. This page outlines how to file a report and how we retain operational data."
      >
        <Button asChild size="lg">
          <a href={`mailto:${siteConfig.contact.abuse}`}>Email abuse team</a>
        </Button>
      </PageHeader>

      <section className="py-16">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="Overview" title="Core points" />
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Related policies:{" "}
            <Link href="/legal/aup" className="text-accent underline">
              Acceptable Use Policy
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="text-accent underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/legal/terms" className="text-accent underline">
              Terms
            </Link>
            .
          </p>
        </Container>
      </section>
    </SiteShell>
  )
}
