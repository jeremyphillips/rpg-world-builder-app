import Link from 'next/link'

import { Badge, ButtonLink, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

export function SiteHero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <Badge appearance="outline" tone="neutral" size="sm">
        Campaign tooling for tabletop RPGs
      </Badge>
      <Heading variant="display" as="h1" className="text-balance">
        Build worlds your party will never forget
      </Heading>
      <Text variant="lead" className="max-w-xl text-pretty">
        Author campaigns, locations, and characters in one place, then run your sessions from a
        focused DM dashboard. No spreadsheets, no clutter.
      </Text>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink link={<Link href={ROUTES.signup} />} size="lg">
          Get started
        </ButtonLink>
        <ButtonLink link={<Link href={ROUTES.login} />} variant="outline" size="lg">
          Log in
        </ButtonLink>
      </div>
    </section>
  )
}
