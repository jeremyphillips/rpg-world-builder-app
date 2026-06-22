'use client'

import { useEffect, type ReactNode } from 'react'

import { CROSS_APP_PATHS } from '@rpg/contracts'

import { SiteHeaderNavSkeleton } from '@/components/site-header-nav-skeleton'

import { useSession } from '../hooks/use-session'

interface AuthRedirectProps {
  children: ReactNode
}

/** Sends authenticated visitors to the dashboard; shows a skeleton while session loads. */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (session?.user) {
      window.location.assign(CROSS_APP_PATHS.dashboard)
    }
  }, [session?.user])

  if (isPending || session?.user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SiteHeaderNavSkeleton />
      </div>
    )
  }

  return children
}
