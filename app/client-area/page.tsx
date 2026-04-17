import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/layout/site-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { LayoutDashboard } from "lucide-react"

export const metadata: Metadata = {
  title: "Client Area",
  description: "Manage your servers, billing, and account.",
}

export default function ClientAreaPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Client area"
        title="Your control plane."
        description="A placeholder for your post-login dashboard — servers, billing, and account management live here."
      />
      <Container className="py-16">
        <Empty className="glass rounded-2xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboard className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>Client dashboard coming soon</EmptyTitle>
            <EmptyDescription>
              This is a placeholder page. Once authentication is wired up, the
              client area will include server management, billing, and team
              controls.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </Container>
    </SiteShell>
  )
}
