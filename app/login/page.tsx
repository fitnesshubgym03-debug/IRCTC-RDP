import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your ZWS Cloud account.",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your ZWS Cloud account to manage servers, billing, and support."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </>
      }
      legal={
        <>
          This is a placeholder UI. Authentication is not wired up yet — see the
          README for integration notes.
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
