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
import {
  fixedCreateToInitialValues,
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

export type LocationContainedCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fixedCreate: LocationFormCtx['fixedCreate'] & {}
  campaignId: string
}

type LocationContainedCreateDrawerBodyProps = LocationContainedCreateDrawerProps & {
  optionsCtx: ContentFormCtx
}

function LocationContainedCreateDrawerBody({
  open,
  onOpenChange,
  fixedCreate,
  campaignId,
  optionsCtx,
}: LocationContainedCreateDrawerBodyProps) {
  const mutation = useContentWriteMutation(locationFormDef, campaignId)
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)

  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }
  const formKey = `location-contained-create-${fixedCreate.authoringType}-${fixedCreate.parent?.locationId ?? 'overview'}-${fixedCreate.settlementType ?? 'none'}`

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
      title={formatLocationAuthoringTypeAddHeading(fixedCreate.authoringType)}
      pending={mutation.isPending}
      submitLabel={formatContentCreateActionLabel('locations')}
      formError={formError}
      wrapForm={(form) => <CampaignAccessFormProvider>{form}</CampaignAccessFormProvider>}
      form={{
        schema: locationDraftFormSchema,
        defaultValues: {
          ...locationFormDef.createDefaultValues,
          ...fixedCreateToInitialValues(fixedCreate),
        },
        valueSyncs: locationFormValueSyncs,
        formKey,
        header: () => (
          <>
            <LocationFixedCreateHiddenFields fixedCreate={fixedCreate} />
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
