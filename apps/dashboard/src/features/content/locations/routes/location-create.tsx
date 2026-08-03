import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import '../lib/location-form-def'

export function LocationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="locations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('locations')}
      backHref={ROUTES.content.locations.overview(campaignId)}
    />
  )
}
