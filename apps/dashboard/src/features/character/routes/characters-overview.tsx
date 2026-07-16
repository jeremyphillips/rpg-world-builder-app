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
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.characters.import()} className={buttonVariants({ variant: 'outline' })}>
            Import character (experimental)
          </Link>
          <Link to={ROUTES.characters.new} className={buttonVariants({ variant: 'default' })}>
            Create character
          </Link>
        </div>
      </div>
      <Text variant="muted">Coming soon.</Text>
    </NarrowPage>
  )
}
