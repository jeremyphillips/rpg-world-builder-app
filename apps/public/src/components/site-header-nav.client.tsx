'use client'

import Link from 'next/link'

import { ButtonLink } from '@rpg/ui'

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
    return <SiteHeaderUserMenu user={user} activeCampaign={session.activeCampaign ?? null} />
  }

  return (
    <>
      <ButtonLink link={<Link href={ROUTES.login} />} variant="ghost" size="sm">
        Log in
      </ButtonLink>
      <ButtonLink link={<Link href={ROUTES.signup} />} size="sm">
        Sign up
      </ButtonLink>
    </>
  )
}
