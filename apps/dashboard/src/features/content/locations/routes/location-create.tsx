import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { useCampaigns } from '@/features/campaign/hooks/use-campaigns'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import '../lib/location-form-def'

export function LocationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const primaryWorldId = campaign?.configuration.settings?.primaryWorldId
  const initialValues = primaryWorldId ? { parentLocationId: primaryWorldId } : undefined

  return (
    <ContentCreateShell
      contentType="locations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('locations')}
      backHref={ROUTES.content.locations.overview(campaignId)}
      initialValues={initialValues}
    />
  )
}
