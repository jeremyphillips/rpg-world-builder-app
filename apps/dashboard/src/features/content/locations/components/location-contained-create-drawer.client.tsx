'use client'

import { useRef } from 'react'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import { notifyContentCreated } from '@/lib/notify'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { createWithDeferredCampaignAccess } from '../../lib/campaign-access/create-with-deferred-campaign-access'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING } from '../../lib/campaign-access/campaign-access-labels'
import { CampaignAccessFormProvider } from '../../lib/campaign-access/campaign-access-form-context.client'
import { formatContentCreateActionLabel } from '../../lib/content-type-labels'
import { useContentWriteMutation } from '../../lib/list/use-content-mutations'
import { contentFormFields, type ContentFormCtx } from '../../lib/forms/content-form-registry'
import { ContentFormDrawer } from '../../lib/forms/shells/content-form-drawer.client'
import { ContentFormOptionsGate } from '../../lib/forms/shells/content-form-shell-layout'
import { ContentFormHeader } from '../../lib/forms/shells/content-form-shell-layout.lib'
import { resolveContentFormSchema } from '../../lib/forms/shells/content-edit-load'
import type { LocationAuthoringType } from '../lib/location-authoring-type'
import {
  buildLocationCreateInitialValues,
  formatLocationAuthoringTypeAddHeading,
} from '../lib/location-create-shortcuts'
import '../lib/location-form-def'
import { locationFormDef } from '../lib/location-form-def'
import type { LocationFormCtx } from '../lib/location-form-ctx'
import type { LocationFormValues } from '../lib/location-form-fields'
import { locationDraftFormSchema } from '../lib/location-form-fields'
import { locationFormValueSyncs } from '../lib/location-form-sync'
import { applyLocationFixedCreateContext } from '../lib/location-form-values'
import { LocationFixedCreateHiddenFields } from './location-fixed-create-hidden-fields.client'

const LOCATION_DRAWER_SHEET_CLASSES = 'bg-background max-w-[550px]'

export type LocationContainedCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  authoringType: LocationAuthoringType
  parentLocationId: string
  campaignId: string
}

type LocationContainedCreateDrawerBodyProps = LocationContainedCreateDrawerProps & {
  optionsCtx: ContentFormCtx
}

function LocationContainedCreateDrawerBody({
  open,
  onOpenChange,
  authoringType,
  parentLocationId,
  campaignId,
  optionsCtx,
}: LocationContainedCreateDrawerBodyProps) {
  const mutation = useContentWriteMutation(locationFormDef, campaignId)
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)

  const fixedCreate = { authoringType, parentLocationId }
  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }
  const formKey = `location-contained-create-${authoringType}-${parentLocationId}`

  const { onSubmit, formError } = useSubmitHandler(async (values) => {
    resolveContentFormSchema(locationFormDef, locationCtx, 'publish').parse(values)

    const overlaidValues = applyLocationFixedCreateContext(
      values as LocationFormValues,
      fixedCreate,
    )

    const { deferredAccessFailed } = await createWithDeferredCampaignAccess({
      campaignId,
      routeKey: locationFormDef.routeKey,
      createInput: {
        ...locationFormDef.toInput(
          overlaidValues,
          {
            weaponCategoryBySlug: locationCtx.options?.weaponCategoryBySlug,
            campaignRules: locationCtx.campaignRules,
            equipmentKind: locationCtx.equipmentKind,
          },
          'publish',
        ),
        status: 'published' as const,
      },
      mutateAsync: (input) => mutation.mutateAsync(input) as Promise<{ id: string }>,
      pendingAccess: campaignAccessDraftRef.current,
    })

    onOpenChange(false)

    if (deferredAccessFailed) {
      toast.warning(CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING)
    } else {
      notifyContentCreated('locations')
    }
  }, 'Could not create locations.')

  return (
    <ContentFormDrawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          campaignAccessDraftRef.current = null
        }
        onOpenChange(nextOpen)
      }}
      title={formatLocationAuthoringTypeAddHeading(authoringType)}
      sheetContentClassName={LOCATION_DRAWER_SHEET_CLASSES}
      pending={mutation.isPending}
      submitLabel={formatContentCreateActionLabel('locations')}
      formError={formError}
      wrapForm={(form) => <CampaignAccessFormProvider>{form}</CampaignAccessFormProvider>}
      form={{
        schema: locationDraftFormSchema,
        defaultValues: {
          ...locationFormDef.createDefaultValues,
          ...buildLocationCreateInitialValues({ authoringType, parentLocationId }),
        },
        valueSyncs: locationFormValueSyncs,
        formKey,
        header: () => (
          <>
            <LocationFixedCreateHiddenFields
              authoringType={authoringType}
              parentLocationId={parentLocationId}
            />
            <ContentFormHeader
              def={locationFormDef}
              ctx={locationCtx}
              formKey={formKey}
              campaignId={campaignId}
              onCampaignAccessDraftChange={(patch) => {
                campaignAccessDraftRef.current = patch
              }}
            />
          </>
        ),
        fields: contentFormFields(locationFormDef, locationCtx),
      }}
      onSubmit={onSubmit}
    />
  )
}

/** Contextual create drawer for contained locations — locks type and parent for the session. */
export function LocationContainedCreateDrawer({
  campaignId,
  ...props
}: LocationContainedCreateDrawerProps) {
  return (
    <ContentFormOptionsGate campaignId={campaignId}>
      {(optionsCtx) => (
        <LocationContainedCreateDrawerBody
          campaignId={campaignId}
          optionsCtx={optionsCtx}
          {...props}
        />
      )}
    </ContentFormOptionsGate>
  )
}
