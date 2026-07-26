'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { AuthRedirect, SignupForm } from '@/features/auth'

function SignupPageContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  return (
    <AuthRedirect returnTo={returnTo}>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SignupForm />
      </div>
    </AuthRedirect>
  )
}

export function SignupPageClient() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={null}>
          <SignupPageContent />
        </Suspense>
      </main>
    </div>
  )
}
