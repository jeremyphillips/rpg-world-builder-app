import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
// Registers the species form def into the content form registry on module load.
import '../lib/species-form-def'

export function SpeciesCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="species"
      campaignId={campaignId}
      heading={formatContentCreateHeading('species')}
      backHref={ROUTES.content.species.overview(campaignId)}
    />
  )
}
