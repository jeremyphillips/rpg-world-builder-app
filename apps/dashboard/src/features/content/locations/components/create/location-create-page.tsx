import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { useCampaigns } from '@/features/campaign'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'

import { ContentCreateShell } from '../../../lib/forms/shells/create/content-create-shell'
import {
  parseLocationCreatePrefillFromSearchParams,
  parseLocationCreateSoftParent,
} from '../../lib/create/location-create-shortcuts'
import { resolveLocationCreatePageModel } from '../../lib/create/session/location-create-page.lib'
import '../../lib/forms/location-form-def'

export type LocationCreatePageProps = {
  campaignId: string
}

export function LocationCreatePage({ campaignId }: LocationCreatePageProps) {
  const [searchParams] = useSearchParams()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const primaryWorldId = campaign?.configuration.settings?.primaryWorldId

  const prefill = useMemo(
    () => parseLocationCreatePrefillFromSearchParams(searchParams),
    [searchParams],
  )
  const softParentLocationId = parseLocationCreateSoftParent(searchParams)

  const { formCtx, initialValues } = resolveLocationCreatePageModel(
    prefill,
    softParentLocationId,
    primaryWorldId,
  )

  return (
    <ContentCreateShell
      contentType="locations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('locations')}
      backHref={ROUTES.content.locations.overview(campaignId)}
      initialValues={initialValues}
      formCtx={formCtx}
    />
  )
}
