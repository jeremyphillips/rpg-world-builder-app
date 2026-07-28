import Link from 'next/link'
import { APP_NAME } from '@rpg/contracts'

import { Heading } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

import { SiteHeaderNav } from './site-header-nav.client'

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href={ROUTES.home}>
          <Heading variant="brand" as="span">
            {APP_NAME}
          </Heading>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Account">
          <SiteHeaderNav />
        </nav>
      </div>
    </header>
  )
}
