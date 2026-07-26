'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { AuthRedirect, LoginForm } from '@/features/auth'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  return (
    <AuthRedirect returnTo={returnTo}>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <LoginForm />
      </div>
    </AuthRedirect>
  )
}

export function LoginPageClient() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={null}>
          <LoginPageContent />
        </Suspense>
      </main>
    </div>
  )
}
