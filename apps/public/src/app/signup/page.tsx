import type { Metadata } from 'next'

import { SiteHeader } from '@/components/site-header'
import { SignupForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Sign up - RPG World Builder',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <SignupForm />
      </main>
    </div>
  )
}
