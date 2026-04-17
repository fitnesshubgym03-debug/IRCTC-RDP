import { AuthShell } from '@/components/auth/auth-shell'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Create Account | ZWS Cloud',
  description: 'Sign up for ZWS Cloud and deploy your first VPS',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Deploy your first VPS in under a minute"
      footerText="Already have an account?"
      footerLink={{ href: '/login', label: 'Sign in' }}
    >
      <SignupForm />
    </AuthShell>
  )
}
