'use client'

import { useEffect, type ReactNode } from 'react'

import { CROSS_APP_PATHS, validateAuthContinuationPath } from '@rpg/contracts'

import { SiteHeaderNavSkeleton } from '@/components/site-header-nav-skeleton'

import { useSession } from '../hooks/use-session'

interface AuthRedirectProps {
  children: ReactNode
  /** When set, authenticated visitors return here instead of the dashboard. */
  returnTo?: string | null
}

/** Sends authenticated visitors to the dashboard or a validated return path. */
export function AuthRedirect({ children, returnTo }: AuthRedirectProps) {
  const { data: session, isPending } = useSession()
  const validatedReturnTo = validateAuthContinuationPath(returnTo)

  useEffect(() => {
    if (!session?.user) return
    window.location.assign(validatedReturnTo ?? CROSS_APP_PATHS.dashboard)
  }, [session?.user, validatedReturnTo])

  if (isPending || session?.user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SiteHeaderNavSkeleton />
      </div>
    )
  }

  return children
}
