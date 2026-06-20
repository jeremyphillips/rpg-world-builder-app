import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function SpeciesCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="species"
      campaignId={campaignId}
      heading="New Species"
      backHref={ROUTES.content.species.overview(campaignId)}
    />
  )
}
