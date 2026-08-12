'use client'

import type { z } from 'zod'
import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { toast } from '@rpg/ui'
import type { FormValueSync } from '@rpg/ui/form'

import { notifyContentCreated } from '@/lib/notify'
import { useSubmitHandler, type FormSubmitHandler } from '@/lib/use-submit-handler'
import { createWithDeferredCampaignAccess } from '../../lib/campaign-access/create-with-deferred-campaign-access'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING } from '../../lib/campaign-access/campaign-access-labels'
import { CampaignAccessFormProvider } from '../../lib/campaign-access/campaign-access-form-context.client'
import {
  invalidateContentFormDefQueries,
  useContentWriteMutation,
} from '../../lib/list/use-content-mutations'
import { invalidateLocationConnectionQueries } from '../../lib/invalidate-location-connection-queries'
import { organizationsQueryKey } from '../../organizations'
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
  applyBuildingCreateSetupProjection,
  buildBuildingClassificationFromCreateSetup,
  type BuildingCreateSetupProjection,
} from '../lib/location-building-create-setup.lib'
import {
  createSettlementWithStartingDistricts,
  resolveSettlementCreateCompletionToast,
  resolveSettlementStructureAuthoringGuidance,
  validateSettlementCreateComposition,
} from '../lib/location-settlement-create-composition.lib'
import {
  BUILDING_OPERATOR_FORM_PATH,
  buildBuildingOperatorCreateInput,
  buildingOperatorDefaultValues,
  buildingOperatorFormValueSyncs,
  buildBuildingOperatorFormItems,
  createBuildingWithOptionalOperator,
  locationBuildingCreateDraftFormSchema,
  pruneBuildingOperatorDraft,
  resolveBuildingCreateCompletionToast,
  type LocationBuildingCreateFormValues,
} from '../lib/location-building-create-composition.lib'
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
  buildingSetupApplication?: {
    revision: number
    projection: BuildingCreateSetupProjection
  }
  onBuildingClassificationChange?: (classification: {
    form?: BuildingCreateSetupProjection['form']
    facilityType?: BuildingCreateSetupProjection['facilityType']
  }) => void
}

type LocationCreateFormBodyProps = LocationCreateFormProps

type FixedSettlementCreateContext = LocationFixedCreateContext & {
  settlementType: NonNullable<LocationFixedCreateContext['settlementType']>
}

type BuildingClassificationDraft = Parameters<
  NonNullable<LocationCreateFormProps['onBuildingClassificationChange']>
>[0]

function normalizeBuildingClassification(
  classification: LocationDraftFormValues['classification'],
): BuildingClassificationDraft {
  const normalized: BuildingClassificationDraft = {}
  if (classification?.form) normalized.form = classification.form
  if (classification?.facilityType) normalized.facilityType = classification.facilityType
  return normalized
}

function buildingClassificationMatches(
  classification: BuildingClassificationDraft,
  projection: BuildingCreateSetupProjection,
): boolean {
  return (
    classification.form === projection.form &&
    classification.facilityType === projection.facilityType
  )
}

function LocationBuildingSetupProjectionBridge({
  application,
  onClassificationChange,
}: {
  application: NonNullable<LocationCreateFormProps['buildingSetupApplication']>
  onClassificationChange?: LocationCreateFormProps['onBuildingClassificationChange']
}) {
  const form = useFormContext<LocationDraftFormValues>()
  const classification = useWatch({ control: form.control, name: 'classification' })
  const appliedRevisionRef = useRef<number | null>(null)
  const observedRevisionRef = useRef<number | null>(null)

  useEffect(() => {
    if (appliedRevisionRef.current === application.revision) return
    const nextValues = applyBuildingCreateSetupProjection(
      form.getValues() as LocationFormValues,
      application.projection,
    )
    appliedRevisionRef.current = application.revision
    observedRevisionRef.current = null
    form.setValue('classification.form', nextValues.classification?.form, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    })
    form.setValue('classification.facilityType', nextValues.classification?.facilityType, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    })
    if (!nextValues.classification) {
      form.setValue('classification', undefined, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      })
    }

    if (application.projection.operatorIntent === 'create') {
      const currentOperator = form.getValues(BUILDING_OPERATOR_FORM_PATH as never)
      if (currentOperator === undefined) {
        form.setValue(
          BUILDING_OPERATOR_FORM_PATH as never,
          buildingOperatorDefaultValues().operatorOrganization as never,
          { shouldDirty: true, shouldTouch: false, shouldValidate: false },
        )
      }
    } else {
      const currentValues = form.getValues() as Record<string, unknown>
      if (pruneBuildingOperatorDraft(currentValues) !== currentValues) {
        form.unregister(BUILDING_OPERATOR_FORM_PATH as never)
      }
    }
    onClassificationChange?.(normalizeBuildingClassification(nextValues.classification))
  }, [application, form, onClassificationChange])

  useEffect(() => {
    if (appliedRevisionRef.current == null) return
    if (observedRevisionRef.current !== application.revision) {
      const matchesProjection = buildingClassificationMatches(
        normalizeBuildingClassification(classification),
        application.projection,
      )
      if (matchesProjection) observedRevisionRef.current = application.revision
      return
    }
    onClassificationChange?.(normalizeBuildingClassification(classification))
  }, [application.projection, application.revision, classification, onClassificationChange])

  return null
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
  formSchema?: z.ZodType<LocationDraftFormValues>
  formDefaultValues?: Record<string, unknown>
  formValueSyncs?: FormValueSync[]
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
  buildingSetupApplication,
  onBuildingClassificationChange,
  campaignAccessDraftRef,
  fields,
  pending,
  extraUnsavedEdits,
  onSubmit,
  formError,
  formSchema = locationDraftFormSchema,
  formDefaultValues,
  formValueSyncs = locationFormValueSyncs,
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
          schema: formSchema,
          defaultValues: {
            ...locationFormDef.createDefaultValues,
            ...fixedCreateToInitialValues(fixedCreate),
            ...formDefaultValues,
          },
          valueSyncs: formValueSyncs,
          formKey,
          header: () => (
            <>
              {buildingSetupApplication ? (
                <LocationBuildingSetupProjectionBridge
                  application={buildingSetupApplication}
                  onClassificationChange={onBuildingClassificationChange}
                />
              ) : null}
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

function LocationBuildingCreateForm(props: LocationCreateFormBodyProps) {
  const { campaignId, fixedCreate, optionsCtx, buildingSetupApplication } = props
  const queryClient = useQueryClient()
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)
  const [compositionPending, setCompositionPending] = useState(false)
  const createsOperator = buildingSetupApplication?.projection.operatorIntent === 'create'
  const setupClassification = buildingSetupApplication
    ? buildBuildingClassificationFromCreateSetup(buildingSetupApplication.projection)
    : undefined

  const locationCtx: LocationFormCtx = {
    ...optionsCtx,
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
    fixedCreate,
  }

  const fields = composeLocationCreateBodyFields(locationCtx, {
    afterDescription: createsOperator ? buildBuildingOperatorFormItems(locationCtx) : undefined,
  })

  const { onSubmit, formError } = useSubmitHandler<LocationDraftFormValues>(async (values) => {
    resolveContentFormSchema(locationFormDef, locationCtx, 'publish').parse(values)
    const canonicalValues = applyLocationFixedCreateContext(
      values as LocationFormValues,
      fixedCreate,
    )
    const buildingCreateInput = {
      ...locationFormDef.toInput(
        canonicalValues,
        {
          weaponCategoryBySlug: locationCtx.options?.weaponCategoryBySlug,
          campaignRules: locationCtx.campaignRules,
          equipmentKind: locationCtx.equipmentKind,
        },
        'publish',
      ),
      status: 'published' as const,
    }
    const operatorCreateInput = createsOperator
      ? buildBuildingOperatorCreateInput(values as LocationBuildingCreateFormValues)
      : undefined

    setCompositionPending(true)
    try {
      const result = await createBuildingWithOptionalOperator({
        campaignId,
        locationRouteKey: locationFormDef.routeKey,
        buildingCreateInput,
        pendingAccess: campaignAccessDraftRef.current,
        operatorCreateInput,
      })

      invalidateContentFormDefQueries(queryClient, campaignId, locationFormDef)
      if (
        result.operator.status !== 'not_requested' &&
        result.operator.status !== 'organization_failed'
      ) {
        void queryClient.invalidateQueries({ queryKey: organizationsQueryKey(campaignId) })
        await invalidateLocationConnectionQueries(queryClient, {
          campaignId,
          organizationId: result.operator.organization.id,
          locationIds: [result.building.id],
        })
      } else if (result.operator.status === 'organization_failed') {
        void queryClient.invalidateQueries({ queryKey: organizationsQueryKey(campaignId) })
      }

      const toastResult = resolveBuildingCreateCompletionToast(result)
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
      onSubmit={onSubmit}
      formError={formError}
      formSchema={createsOperator ? locationBuildingCreateDraftFormSchema : locationDraftFormSchema}
      formDefaultValues={{
        ...(setupClassification ? { classification: setupClassification } : {}),
        ...(createsOperator ? buildingOperatorDefaultValues() : {}),
      }}
      formValueSyncs={
        createsOperator
          ? [...locationFormValueSyncs, ...buildingOperatorFormValueSyncs]
          : locationFormValueSyncs
      }
    />
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

  if (props.fixedCreate.authoringType === 'building' && props.buildingSetupApplication) {
    return <LocationBuildingCreateForm {...props} />
  }

  return <LocationGenericCreateForm {...props} />
}

/** Domain create form body for LocationCreateModal (and future focused-edit drawers). */
export function LocationCreateForm(props: LocationCreateFormProps): ReactNode {
  return <LocationCreateFormBody {...props} />
}
