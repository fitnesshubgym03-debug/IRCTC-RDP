import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Sign up for ZWS Cloud.",
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Deploy your first VPS in under a minute. Billing starts only after you launch."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </>
      }
      legal={
        <>
          By creating an account you agree to our{" "}
          <Link href="/legal/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
