'use client'

import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { useCampaigns } from '@/features/campaign'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import { LocationSettlementCreateSetup } from './location-settlement-create-setup.client'
import {
  buildLocationFixedCreateHref,
  fixedCreateToInitialValues,
  parseLocationCreateSessionFromSearchParams,
  parseLocationCreateSoftParent,
} from '../lib/location-create-shortcuts'
import { completeLocationCreateSetup } from '../lib/location-create-session'
import type { LocationFormCtx } from '../lib/location-form-ctx'
import type { LocationFormValues } from '../lib/location-form-fields'
import { applyLocationFixedCreateContext } from '../lib/location-form-values'
import '../lib/location-form-def'

export type LocationCreatePageProps = {
  campaignId: string
}

export function LocationCreatePage({ campaignId }: LocationCreatePageProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: campaigns } = useCampaigns()
  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  const primaryWorldId = campaign?.configuration.settings?.primaryWorldId

  const session = useMemo(
    () => parseLocationCreateSessionFromSearchParams(searchParams),
    [searchParams],
  )
  const softParentLocationId = parseLocationCreateSoftParent(searchParams)

  const navigateToFixedCreate = useCallback(
    (fixedCreate: NonNullable<LocationFormCtx['fixedCreate']>) => {
      navigate(
        buildLocationFixedCreateHref(
          campaignId,
          fixedCreate,
          softParentLocationId ?? primaryWorldId,
        ),
      )
    },
    [campaignId, navigate, primaryWorldId, softParentLocationId],
  )

  if (session.kind === 'needsSetup') {
    return (
      <LocationSettlementCreateSetup
        open
        onOpenChange={(open) => {
          if (!open) {
            navigate(ROUTES.content.locations.create(campaignId))
          }
        }}
        onComplete={(result) => {
          navigateToFixedCreate(completeLocationCreateSetup(session.intent, result))
        }}
      />
    )
  }

  const fixedCreate = session.kind === 'ready' ? session.fixedCreate : undefined
  const initialValues = fixedCreate
    ? fixedCreateToInitialValues(fixedCreate, softParentLocationId ?? primaryWorldId)
    : softParentLocationId || primaryWorldId
      ? { parentLocationId: softParentLocationId ?? primaryWorldId }
      : undefined

  const formCtx: LocationFormCtx | undefined = fixedCreate ? { fixedCreate } : undefined

  return (
    <ContentCreateShell
      contentType="locations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('locations')}
      backHref={ROUTES.content.locations.overview(campaignId)}
      initialValues={initialValues}
      formCtx={formCtx}
      prepareSubmitValues={
        fixedCreate
          ? (values) => applyLocationFixedCreateContext(values as LocationFormValues, fixedCreate)
          : undefined
      }
    />
  )
}
