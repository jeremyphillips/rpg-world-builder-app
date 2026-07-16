import { Link, useSearchParams } from 'react-router-dom'
import { buttonVariants, Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'

import { CharacterImportForm } from '../components/character-import-form.client'

export function CharacterImportRoute() {
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  return (
    <NarrowPage>
      <div className="mb-6 flex items-start justify-between gap-4">
        <Heading variant="page" as="h1">
          Import D&amp;D Beyond character
        </Heading>
        <Link to={ROUTES.characters.list} className={buttonVariants({ variant: 'outline' })}>
          Back to characters
        </Link>
      </div>

      <CharacterImportForm campaignId={campaignId} />
    </NarrowPage>
  )
}
