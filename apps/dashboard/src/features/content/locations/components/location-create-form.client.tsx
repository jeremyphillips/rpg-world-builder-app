'use client'

import type { z } from 'zod'
import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import { notifyContentCreated } from '@/lib/notify'
import { useSubmitHandler, type FormSubmitHandler } from '@/lib/use-submit-handler'
import { createWithDeferredCampaignAccess } from '../../lib/campaign-access/create-with-deferred-campaign-access'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING } from '../../lib/campaign-access/campaign-access-labels'
import { CampaignAccessFormProvider } from '../../lib/campaign-access/campaign-access-form-context.client'
import {
  invalidateContentFormDefQueries,
  useContentWriteMutation,
} from '../../lib/list/use-content-mutations'
import { contentFormFields, type ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  ContentFormHost,
  type ContentFormHostChrome,
  type ContentFormHostLeaveBridge,
} from '../../lib/forms/shells/content-form-host.client'
import { ContentFormHeader } from '../../lib/forms/shells/content-form-shell-layout.lib'
import { resolveContentFormSchema } from '../../lib/forms/shells/content-edit-load'
import { fixedCreateToInitialValues } from '../lib/location-create-shortcuts'
import '../lib/location-form-def'
import { locationFormDef } from '../lib/location-form-def'
import type { LocationFormCtx } from '../lib/location-form-ctx'
import type { LocationFixedCreateContext } from '../lib/location-form-ctx'
import {
  composeLocationCreateBodyFields,
  buildSettlementStartingDistrictsFormItems,
  locationDraftFormSchema,
  type LocationFormValues,
} from '../lib/location-form-fields'
import { locationFormValueSyncs } from '../lib/location-form-sync'
import { applyLocationFixedCreateContext } from '../lib/location-form-values'
import {
  createSettlementWithStartingDistricts,
  resolveSettlementCreateCompletionToast,
  resolveSettlementStructureAuthoringGuidance,
  validateSettlementCreateComposition,
} from '../lib/location-settlement-create-composition.lib'
import { LocationCreateDraftPrune } from './location-create-draft-prune.client'
import { LocationFixedCreateHiddenFields } from './location-fixed-create-hidden-fields.client'
import {
  SettlementCreateCompositionProvider,
  useSettlementCreateComposition,
} from './settlement-create-composition-context.client'

type LocationDraftFormValues = z.infer<typeof locationDraftFormSchema>

export type LocationCreateFormProps = {
  fixedCreate: LocationFixedCreateContext
  campaignId: string
  optionsCtx: ContentFormCtx
  mounted: boolean
  leaveGuardEnabled: boolean
  leaveBridgeRef: MutableRefObject<ContentFormHostLeaveBridge | null>
  chrome: ContentFormHostChrome | ((ctx: { pending: boolean }) => ContentFormHostChrome)
  onTrustedClose: () => void
  /** Stable across setup revisits so draft/dirty survive phase swaps. */
  formKey: string
  /** When false, form stays mounted for dirty tracking but is not shown. */
  visible?: boolean
  onPendingChange?: (pending: boolean) => void
}

type LocationCreateFormBodyProps = LocationCreateFormProps

type FixedSettlementCreateContext = LocationFixedCreateContext & {
  settlementType: NonNullable<LocationFixedCreateContext['settlementType']>
}

function isSettlementWithStartingDistricts(
  fixedCreate: LocationFixedCreateContext,
): fixedCreate is FixedSettlementCreateContext {
  return fixedCreate.authoringType === 'settlement' && fixedCreate.settlementType != null
}

type LocationCreateFormShellProps = LocationCreateFormBodyProps & {
  campaignAccessDraftRef: MutableRefObject<ContentCampaignAccessPatch | null>
  fields: ReturnType<typeof contentFormFields>
  pending: boolean
  extraUnsavedEdits?: boolean
  onSubmit: FormSubmitHandler<LocationDraftFormValues>
  formError?: string | null
}

function LocationCreateFormShell({
  fixedCreate,
  campaignId,
  optionsCtx,
  mounted,
  leaveGuardEnabled,
  leaveBridgeRef,
  chrome,
  onTrustedClose,
  formKey,
  visible = true,
  onPendingChange,
  campaignAccessDraftRef,
  fields,
  pending,
  extraUnsavedEdits,
  onSubmit,
  formError,
}: LocationCreateFormShellProps) {
  useEffect(() => {
    onPendingChange?.(pending)
  }, [onPendingChange, pending])

  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }

  // Keep a stable wrapper so toggling `visible` does not remount the form (dirty/leave bridge).
  return (
    <div className={visible ? undefined : 'hidden'} aria-hidden={visible ? undefined : true}>
      <ContentFormHost
        mounted={mounted}
        leaveGuardEnabled={leaveGuardEnabled}
        pending={pending}
        formError={formError}
        extraUnsavedEdits={extraUnsavedEdits}
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
              <LocationCreateDraftPrune fixedCreate={fixedCreate} />
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
          fields,
        }}
        leaveBridgeRef={leaveBridgeRef}
        chrome={typeof chrome === 'function' ? chrome({ pending }) : chrome}
        onSubmit={onSubmit}
        onTrustedClose={() => {
          campaignAccessDraftRef.current = null
          onTrustedClose()
        }}
      />
    </div>
  )
}

function LocationGenericCreateForm(props: LocationCreateFormBodyProps) {
  const { campaignId, fixedCreate, optionsCtx } = props
  const mutation = useContentWriteMutation(locationFormDef, campaignId)
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)

  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }

  const { onSubmit, formError } = useSubmitHandler<LocationDraftFormValues>(async (values) => {
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
    <LocationCreateFormShell
      {...props}
      campaignAccessDraftRef={campaignAccessDraftRef}
      fields={contentFormFields(locationFormDef, locationCtx)}
      pending={mutation.isPending}
      onSubmit={onSubmit}
      formError={formError}
    />
  )
}

function LocationSettlementCreateForm(
  props: LocationCreateFormBodyProps & { fixedCreate: FixedSettlementCreateContext },
) {
  const { campaignId, fixedCreate, optionsCtx } = props
  const queryClient = useQueryClient()
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)
  const [compositionPending, setCompositionPending] = useState(false)
  const settlementComposition = useSettlementCreateComposition()

  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }

  const guidance = resolveSettlementStructureAuthoringGuidance(fixedCreate.settlementType)
  const fields = composeLocationCreateBodyFields(locationCtx, {
    afterDescription: buildSettlementStartingDistrictsFormItems(guidance),
  })

  const { onSubmit, formError } = useSubmitHandler<LocationDraftFormValues>(async (values) => {
    resolveContentFormSchema(locationFormDef, locationCtx, 'publish').parse(values)

    const overlaidValues = applyLocationFixedCreateContext(
      values as LocationFormValues,
      fixedCreate,
    )

    const compositionValidation = validateSettlementCreateComposition(
      settlementComposition.composition,
    )
    if (!compositionValidation.ok) {
      throw new Error(compositionValidation.message)
    }

    setCompositionPending(true)
    try {
      const settlementCreateInput = {
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
      }

      const result = await createSettlementWithStartingDistricts({
        campaignId,
        routeKey: locationFormDef.routeKey,
        settlementCreateInput,
        pendingAccess: campaignAccessDraftRef.current,
        composition: settlementComposition.composition,
      })

      invalidateContentFormDefQueries(queryClient, campaignId, locationFormDef)

      const toastResult = resolveSettlementCreateCompletionToast({
        settlementType: fixedCreate.settlementType,
        deferredAccessFailed: result.deferredAccessFailed,
        districtsFailedCount: result.districts.failed.length,
      })

      if (toastResult.kind === 'success') {
        notifyContentCreated('locations')
      } else {
        toast.warning(toastResult.message)
      }
    } finally {
      setCompositionPending(false)
    }
  }, 'Could not create locations.')

  return (
    <LocationCreateFormShell
      {...props}
      campaignAccessDraftRef={campaignAccessDraftRef}
      fields={fields}
      pending={compositionPending}
      extraUnsavedEdits={settlementComposition.isDirty || undefined}
      onSubmit={onSubmit}
      formError={formError}
    />
  )
}

function LocationCreateFormBody(props: LocationCreateFormBodyProps) {
  if (isSettlementWithStartingDistricts(props.fixedCreate)) {
    return (
      <SettlementCreateCompositionProvider
        key={
          props.mounted
            ? `${props.formKey}-${props.fixedCreate.settlementType}`
            : `${props.formKey}-closed`
        }
      >
        <LocationSettlementCreateForm {...props} fixedCreate={props.fixedCreate} />
      </SettlementCreateCompositionProvider>
    )
  }

  return <LocationGenericCreateForm {...props} />
}

/** Domain create form body for LocationCreateModal (and future focused-edit drawers). */
export function LocationCreateForm(props: LocationCreateFormProps): ReactNode {
  return <LocationCreateFormBody {...props} />
}
