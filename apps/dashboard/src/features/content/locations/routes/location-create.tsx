import { useParams, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { useCampaigns } from '@/features/campaign/hooks/use-campaigns'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import {
  buildLocationCreateInitialValues,
  parseLocationCreatePrefill,
} from '../lib/location-create-shortcuts'
import '../lib/location-form-def'

export function LocationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const [searchParams] = useSearchParams()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const primaryWorldId = campaign?.configuration.settings?.primaryWorldId
  const prefill = parseLocationCreatePrefill(searchParams)
  const initialValues = buildLocationCreateInitialValues(prefill, {
    parentLocationId: primaryWorldId,
  })

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
