import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your ZWS Cloud password.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email associated with your account and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
