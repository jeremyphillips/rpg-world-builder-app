import Link from 'next/link'

import { buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

export function SiteHero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
        Campaign tooling for tabletop RPGs
      </span>
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        Build worlds your party will never forget
      </h1>
      <p className="max-w-xl text-pretty text-lg text-muted-foreground">
        Author campaigns, locations, and characters in one place, then run your sessions from a
        focused DM dashboard. No spreadsheets, no clutter.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={ROUTES.signup} className={buttonVariants({ size: 'lg' })}>
          Get started
        </Link>
        <Link href={ROUTES.login} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          Log in
        </Link>
      </div>
    </section>
  )
}
