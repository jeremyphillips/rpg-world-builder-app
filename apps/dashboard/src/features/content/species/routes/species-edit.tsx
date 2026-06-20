import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useSpecies } from '../hooks/use-species'

export function SpeciesEdit() {
  const { campaignId = '', speciesId = '' } = useParams<{
    campaignId: string
    speciesId: string
  }>()
  const { isPending, isError } = useSpecies(campaignId)

  return (
    <ContentEditShell
      contentType="species"
      campaignId={campaignId}
      entityId={speciesId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load species."
      notFoundLabel="Species not found."
      backHref={ROUTES.content.species.detail(campaignId, speciesId)}
    />
  )
}
