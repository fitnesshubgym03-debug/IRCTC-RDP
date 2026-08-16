import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/brand/logo"
import { footerNav, siteConfig } from "@/data/site"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-24 bg-background/40 backdrop-blur-sm">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground text-pretty">
              High-Speed Remote Desktop Infrastructure. Built for reliable
              remote workflows, low-latency access, and always-on sessions.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <SocialIcon href={siteConfig.social.twitter} label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.github} label="GitHub">
                <Github className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.linkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          {Object.entries(footerNav).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {section}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p>
            High-Speed Remote Desktop Infrastructure · Built for India-first workflows.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider">
            Build {siteConfig.buildVersion}
          </p>
        </div>
      </Container>
    </footer>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="glass glass-hover inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  )
}
