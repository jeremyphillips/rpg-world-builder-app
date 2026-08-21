import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/edit/content-edit-shell'
import { useLocations } from '../hooks/use-locations'
import '../lib/forms/location-form-def'

export function LocationEdit() {
  const { campaignId = '', locationId = '' } = useParams<{
    campaignId: string
    locationId: string
  }>()
  const { isPending, isError } = useLocations(campaignId)

  return (
    <ContentEditShell
      contentType="locations"
      campaignId={campaignId}
      entityId={locationId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel={formatContentListLoadErrorMessage('locations')}
      notFoundLabel={formatContentNotFoundMessage('locations')}
      backHref={ROUTES.content.locations.detail(campaignId, locationId)}
      overviewHref={ROUTES.content.locations.overview(campaignId)}
      contentTypeKey="locations"
    />
  )
}
