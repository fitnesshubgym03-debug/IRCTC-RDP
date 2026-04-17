import type { Metadata } from "next"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { ContactForm } from "@/components/contact/contact-form"
import { siteConfig } from "@/data/site"
import { Mail, LifeBuoy, ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the ZWS Cloud team.",
}

const channels = [
  {
    icon: Mail,
    title: "Sales & partnerships",
    desc: "For pricing, custom quotes, and enterprise conversations.",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: LifeBuoy,
    title: "Customer support",
    desc: "Existing customers — open a ticket for the fastest response.",
    value: siteConfig.contact.support,
    href: `mailto:${siteConfig.contact.support}`,
  },
  {
    icon: ShieldAlert,
    title: "Abuse & security",
    desc: "Report abuse, vulnerabilities, or policy violations.",
    value: siteConfig.contact.abuse,
    href: `mailto:${siteConfig.contact.abuse}`,
  },
]

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a real person."
        description="We triage every message. Median response time is under one business day."
      />
      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            {channels.map(({ icon: Icon, title, desc, value, href }) => (
              <a
                key={title}
                href={href}
                className="glass glass-hover group flex gap-4 rounded-2xl p-5"
              >
                <div className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  <p className="mt-2 font-mono text-xs text-accent group-hover:underline">
                    {value}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about your workload or question. We&apos;ll respond
              directly.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
