import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = {
  title: 'Reset Password | IRCTC RDP',
  description: 'Create a new password for your IRCTC RDP account',
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter a new password for your account"
      footerText="Remember your password?"
      footerLink={{ href: '/login', label: 'Sign in' }}
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
