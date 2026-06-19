import Link from 'next/link'

import { buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

export function SiteHero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <Text
        variant="small"
        as="span"
        className="rounded-full border border-border px-3 py-1 text-xs font-medium"
      >
        Campaign tooling for tabletop RPGs
      </Text>
      <Heading variant="display" as="h1" className="text-balance text-4xl sm:text-5xl">
        Build worlds your party will never forget
      </Heading>
      <Text variant="lead" className="max-w-xl text-pretty">
        Author campaigns, locations, and characters in one place, then run your sessions from a
        focused DM dashboard. No spreadsheets, no clutter.
      </Text>
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
