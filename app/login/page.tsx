import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In | ZWS Cloud',
  description: 'Sign in to your ZWS Cloud account',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink={{ href: '/register', label: 'Create one' }}
    >
      <LoginForm />
      <div className="text-center text-xs text-muted-foreground">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot your password?
        </Link>
      </div>
    </AuthShell>
  )
}
