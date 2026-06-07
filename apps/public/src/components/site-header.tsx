import Link from 'next/link'

import { buttonVariants } from '@rpg/ui'

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          RPG World Builder
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  )
}
