import type { Metadata } from 'next'

import { SiteHeader } from '@/components/site-header'
import { AuthRedirect, LoginForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Log in - RPG World Builder',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <AuthRedirect>
          <div className="flex flex-1 items-center justify-center px-6 py-12">
            <LoginForm />
          </div>
        </AuthRedirect>
      </main>
    </div>
  )
}
