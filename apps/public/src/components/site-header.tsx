import Link from 'next/link'

import { buttonVariants, Heading } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href={ROUTES.home}>
          <Heading variant="section" as="span" className="text-lg">
            RPG World Builder
          </Heading>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href={ROUTES.login} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Log in
          </Link>
          <Link href={ROUTES.signup} className={buttonVariants({ size: 'sm' })}>
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  )
}
