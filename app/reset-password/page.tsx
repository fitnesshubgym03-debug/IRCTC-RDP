import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your ZWS Cloud account.",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Pick something strong. We recommend a mix of upper and lower case letters, numbers, and symbols."
      footer={
        <>
          Having trouble?{" "}
          <Link href="/support" className="text-accent hover:underline">
            Contact support
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
