import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/content-edit-shell'
import { useSpecies } from '../hooks/use-species'
// Registers the species form def into the content form registry on module load.
import '../lib/species-form-def'

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
      loadErrorLabel={formatContentListLoadErrorMessage('species')}
      notFoundLabel={formatContentNotFoundMessage('species')}
      backHref={ROUTES.content.species.detail(campaignId, speciesId)}
    />
  )
}
