'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { useCampaigns } from '@/features/campaign'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import { LocationCreateSetupHost } from './location-create-setup-host.client'
import { LocationCreateModal } from './location-create-modal.client'
import { LocationCreateAuthoringTypeWatcher } from './location-create-authoring-type-watcher.client'
import {
  buildLocationFixedCreateHref,
  parseLocationCreateSessionFromSearchParams,
  parseLocationCreateSoftParent,
} from '../lib/location-create-shortcuts'
import { completeLocationCreateSetup } from '../lib/location-create-session'
import { resolveLocationCreatePageModel } from '../lib/location-create-page.lib'
import type { LocationFormCtx } from '../lib/location-form-ctx'
import type { LocationFormValues } from '../lib/location-form-fields'
import { applyLocationFixedCreateContext } from '../lib/location-form-values'
import { LocationFixedCreateHiddenFields } from './location-fixed-create-hidden-fields.client'
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
  const setupCompletedRef = useRef(false)

  useEffect(() => {
    if (session.kind === 'needsSetup') {
      setupCompletedRef.current = false
    }
  }, [session])

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
    if (session.intent.authoringType === 'building') {
      return (
        <LocationCreateModal
          open
          intent={session.intent}
          campaignId={campaignId}
          onOpenChange={(open) => {
            if (!open) navigate(ROUTES.content.locations.create(campaignId))
          }}
        />
      )
    }

    return (
      <LocationCreateSetupHost
        intent={session.intent}
        onOpenChange={(open) => {
          if (!open && !setupCompletedRef.current) {
            navigate(ROUTES.content.locations.create(campaignId))
          }
        }}
        onComplete={(result) => {
          setupCompletedRef.current = true
          navigateToFixedCreate(completeLocationCreateSetup(session.intent, result))
        }}
      />
    )
  }

  const { fixedCreate, initialValues } = resolveLocationCreatePageModel(
    session,
    softParentLocationId,
    primaryWorldId,
  )
  const formCtx: LocationFormCtx | undefined = fixedCreate ? { fixedCreate } : undefined

  return (
    <ContentCreateShell
      contentType="locations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('locations')}
      backHref={ROUTES.content.locations.overview(campaignId)}
      initialValues={initialValues}
      formCtx={formCtx}
      prepareSubmitValues={(values) => {
        const typed = values as LocationFormValues
        if (!fixedCreate && typed.authoringType === 'building') {
          throw new Error('Building create must use the composition coordinator.')
        }
        return fixedCreate ? applyLocationFixedCreateContext(typed, fixedCreate) : values
      }}
      formHeaderPrefix={
        fixedCreate ? (
          <LocationFixedCreateHiddenFields fixedCreate={fixedCreate} />
        ) : (
          <LocationCreateAuthoringTypeWatcher
            campaignId={campaignId}
            softParentLocationId={softParentLocationId ?? primaryWorldId}
          />
        )
      }
    />
  )
}
