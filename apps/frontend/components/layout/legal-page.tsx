import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={`Last updated: ${lastUpdated}. This is template content provided for reference — review with qualified counsel before production use.`}
      />
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </h2>
              <nav className="mt-4 flex flex-col gap-1 text-sm">
                {legalLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <article className="legal-article max-w-3xl">
            {children}
          </article>
        </div>
      </Container>
    </SiteShell>
  )
}

const legalLinks = [
  { label: "Terms & Conditions", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/refund" },
  { label: "SLA", href: "/legal/sla" },
  { label: "Acceptable Use (AUP)", href: "/legal/aup" },
  { label: "KYC Policy", href: "/legal/kyc" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Disclaimer", href: "/legal/disclaimer" },
  { label: "Abuse & Data Retention", href: "/abuse" },
  { label: "Compliance", href: "/compliance" },
]

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10 flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-accent [&_a]:underline [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 flex list-disc flex-col gap-2 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
