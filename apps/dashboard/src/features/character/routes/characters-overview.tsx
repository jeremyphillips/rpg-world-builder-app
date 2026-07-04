import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'

export function CharactersOverview() {
  return (
    <NarrowPage>
      <div className="flex items-start justify-between gap-4">
        <Heading variant="page" as="h1">
          Characters
        </Heading>
        <Link to={ROUTES.characters.new} className={buttonVariants({ variant: 'default' })}>
          Create character
        </Link>
      </div>
      <Text variant="muted">Coming soon.</Text>
    </NarrowPage>
  )
}
