'use client'

import Link from 'next/link'

import { buttonVariants } from '@rpg/ui'

import { useSession } from '@/features/auth'
import { ROUTES } from '@/lib/routes'

import { SiteHeaderNavSkeleton } from './site-header-nav-skeleton'
import { SiteHeaderUserMenu } from './site-header-user-menu.client'

export function SiteHeaderNav() {
  const { data: session, isPending } = useSession()
  const user = session?.user

  if (isPending) {
    return <SiteHeaderNavSkeleton />
  }

  if (user) {
    return <SiteHeaderUserMenu user={user} />
  }

  return (
    <>
      <Link href={ROUTES.login} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        Log in
      </Link>
      <Link href={ROUTES.signup} className={buttonVariants({ size: 'sm' })}>
        Sign up
      </Link>
    </>
  )
}
