import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = {
  title: 'Forgot Password | ZWS Cloud',
  description: 'Reset your ZWS Cloud password',
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Know your password?"
      footerLink={{ href: '/login', label: 'Sign in' }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
