'use client'

import type { z } from 'zod'
import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFormContext, useFormState } from 'react-hook-form'
import { type ContentCampaignAccessPatch } from '@rpg/contracts'
import { Button, cn, toast } from '@rpg/ui'
import { FormShellSubmitButton, useSchemaFormSubmit, type FormValueSync } from '@rpg/ui/form'

import type { CreateWorkflowPanelStatus } from '@/lib/create-flow'
import { notifyContentCreated } from '@/lib/notify'
import { composeFormLeaveDirty } from '@/lib/form-leave-dirty'
import { useSubmitHandler, type FormSubmitHandler } from '@/lib/use-submit-handler'
import { useCampaignAccessForm } from '../../lib/campaign-access/campaign-access-form-context.client'
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
  applyBuildingCreateSetupProjection,
  buildBuildingClassificationFromCreateSetup,
  BUILDING_CREATE_SETUP_HEADLINE,
  type BuildingCreateSetupProjection,
} from '../lib/location-building-create-setup.lib'
import {
  assertClientBuildingCreatePlan,
  buildBuildingCreateCompositionRequest,
  completeBuildingCreateComposition,
  handleBuildingCreateCompositionFailure,
  mapBuildingCreateSubmitError,
  validateBuildingCreateOrganizationsPanel,
} from '../lib/location-building-create-composition.lib'
import { EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN } from '../lib/building-organization-create-drafts'
import type { BuildingOrganizationsCreateTabController } from './building-organizations-create-tab.client'
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
  chrome?: ContentFormHostChrome | ((ctx: { pending: boolean }) => ContentFormHostChrome)
  onTrustedClose: () => void
  /** Stable across setup revisits so draft/dirty survive phase swaps. */
  formKey: string
  /** When false, form stays mounted for dirty tracking but is not shown. */
  visible?: boolean
  onPendingChange?: (pending: boolean) => void
  extraUnsavedEdits?: boolean
  hadSetup?: boolean
  onBack?: () => void
  onCancel?: () => void
  buildingSetupApplication?: {
    revision: number
    projection: BuildingCreateSetupProjection
  }
  organizationsControllerRef?: MutableRefObject<BuildingOrganizationsCreateTabController | null>
  onNavigateToTab?: (tabId: string) => void
  onDetailsStatusChange?: (status: CreateWorkflowPanelStatus) => void
}

type LocationCreateFormBodyProps = LocationCreateFormProps

type FixedSettlementCreateContext = LocationFixedCreateContext & {
  settlementType: NonNullable<LocationFixedCreateContext['settlementType']>
}

function LocationBuildingSetupProjectionBridge({
  application,
}: {
  application: NonNullable<LocationCreateFormProps['buildingSetupApplication']>
}) {
  const form = useFormContext<LocationDraftFormValues>()
  const appliedRevisionRef = useRef<number | null>(null)

  useEffect(() => {
    if (appliedRevisionRef.current === application.revision) return
    const nextValues = applyBuildingCreateSetupProjection(
      form.getValues() as LocationFormValues,
      application.projection,
    )
    appliedRevisionRef.current = application.revision
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
  }, [application, form])

  return null
}

function countFormIssuePaths(errors: Record<string, unknown>): number {
  let count = 0
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== 'object') continue
    if ('message' in value && value.message) {
      count += 1
      continue
    }
    count += countFormIssuePaths(value as Record<string, unknown>)
  }
  return count
}

function LocationCreateDetailsPanelStatusBridge({
  formError,
  extraUnsavedEdits,
  onStatusChange,
}: {
  formError?: string | null
  extraUnsavedEdits?: boolean
  onStatusChange?: (status: CreateWorkflowPanelStatus) => void
}) {
  const { dirtyFields, errors, isSubmitted } = useFormState()
  const campaignAccess = useCampaignAccessForm()
  const issueCount =
    (formError ? 1 : 0) + (isSubmitted ? countFormIssuePaths(errors as Record<string, unknown>) : 0)
  const dirty = composeFormLeaveDirty({
    dirtyFields,
    extraUnsavedEdits,
    campaignAccessDirty: campaignAccess.isDirty,
  })

  useEffect(() => {
    onStatusChange?.({
      invalid: issueCount > 0,
      ...(issueCount > 0 ? { issueCount } : {}),
      dirty,
    })
  }, [dirty, issueCount, onStatusChange])

  return null
}

function BuildingCreateSubmitButton({
  pending,
  submitLabel,
  onSubmit,
  onInvalidDetails,
}: {
  pending: boolean
  submitLabel: string
  onSubmit: FormSubmitHandler<LocationDraftFormValues>
  onInvalidDetails: () => void
}) {
  const schemaFormSubmit = useSchemaFormSubmit<LocationDraftFormValues>()
  if (!schemaFormSubmit) {
    return <FormShellSubmitButton disabled={pending}>{submitLabel}</FormShellSubmitButton>
  }

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => schemaFormSubmit.requestSubmit(onSubmit, onInvalidDetails)}
    >
      {submitLabel}
    </Button>
  )
}

function buildBuildingCreateFooterChrome(input: {
  hadSetup: boolean
  pending: boolean
  submitLabel: string
  onSubmit: FormSubmitHandler<LocationDraftFormValues>
  onInvalidDetails: () => void
  onBack: () => void
  onCancel: () => void
}): ContentFormHostChrome {
  return {
    contentWrapper: (content) => content,
    footer: () => (
      <>
        {input.hadSetup ? (
          <Button type="button" variant="outline" disabled={input.pending} onClick={input.onBack}>
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled={input.pending} onClick={input.onCancel}>
            Cancel
          </Button>
        )}
        <BuildingCreateSubmitButton
          pending={input.pending}
          submitLabel={input.submitLabel}
          onSubmit={input.onSubmit}
          onInvalidDetails={input.onInvalidDetails}
        />
      </>
    ),
  }
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
  onDetailsStatusChange?: (status: CreateWorkflowPanelStatus) => void
  chrome: ContentFormHostChrome | ((ctx: { pending: boolean }) => ContentFormHostChrome)
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
  campaignAccessDraftRef,
  fields,
  pending,
  extraUnsavedEdits,
  onSubmit,
  formError,
  formSchema = locationDraftFormSchema,
  formDefaultValues,
  formValueSyncs = locationFormValueSyncs,
  onDetailsStatusChange,
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
    <div
      className={cn('flex min-h-0 flex-1 flex-col', !visible && 'hidden')}
      aria-hidden={visible ? undefined : true}
    >
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
                <LocationBuildingSetupProjectionBridge application={buildingSetupApplication} />
              ) : null}
              {onDetailsStatusChange ? (
                <LocationCreateDetailsPanelStatusBridge
                  formError={formError}
                  extraUnsavedEdits={extraUnsavedEdits}
                  onStatusChange={onDetailsStatusChange}
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
  const {
    campaignId,
    fixedCreate,
    optionsCtx,
    buildingSetupApplication,
    hadSetup = false,
    onBack = () => undefined,
    onCancel = () => undefined,
    organizationsControllerRef,
    onNavigateToTab,
    onDetailsStatusChange,
  } = props
  const queryClient = useQueryClient()
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)
  const [compositionPending, setCompositionPending] = useState(false)
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
    buildingFacilityAuthoringGroup: buildingSetupApplication?.projection.facilityAuthoringGroup,
    omitBuildingForm: true,
  })

  const { onSubmit, formError } = useSubmitHandler<LocationDraftFormValues>({
    fallbackMessage: 'Could not create building.',
    mapError: mapBuildingCreateSubmitError,
    submit: async (values, form) => {
      resolveContentFormSchema(locationFormDef, locationCtx, 'publish').parse(values)
      const overlaidValues = applyLocationFixedCreateContext(
        values as LocationFormValues,
        fixedCreate,
      )
      const buildingCreateInput = locationFormDef.toInput(
        overlaidValues,
        {
          weaponCategoryBySlug: locationCtx.options?.weaponCategoryBySlug,
          campaignRules: locationCtx.campaignRules,
          equipmentKind: locationCtx.equipmentKind,
        },
        'publish',
      )

      const organizationsController = organizationsControllerRef?.current
      await validateBuildingCreateOrganizationsPanel({
        organizationsController,
        onNavigateToTab,
      })

      const plan = organizationsController?.getPayload() ?? EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN
      const request = buildBuildingCreateCompositionRequest({
        buildingInput: buildingCreateInput,
        plan,
      })
      assertClientBuildingCreatePlan({
        request,
        form,
        organizationsController,
        onNavigateToTab,
      })

      setCompositionPending(true)
      try {
        const toastResult = await completeBuildingCreateComposition({
          campaignId,
          request,
          queryClient,
          pendingAccess: campaignAccessDraftRef.current,
          organizationsController,
        })
        if (toastResult.kind === 'success') {
          notifyContentCreated('locations')
        } else {
          toast.warning(toastResult.message)
        }
      } catch (error) {
        handleBuildingCreateCompositionFailure({
          error,
          form,
          organizationsController,
          onNavigateToTab,
        })
      } finally {
        setCompositionPending(false)
      }
    },
  })

  const submitLabel = BUILDING_CREATE_SETUP_HEADLINE

  return (
    <LocationCreateFormShell
      {...props}
      campaignAccessDraftRef={campaignAccessDraftRef}
      fields={fields}
      pending={compositionPending}
      onSubmit={onSubmit}
      formError={formError}
      onDetailsStatusChange={onDetailsStatusChange}
      formDefaultValues={{
        ...(setupClassification ? { classification: setupClassification } : {}),
      }}
      chrome={({ pending }) =>
        buildBuildingCreateFooterChrome({
          hadSetup,
          pending,
          submitLabel,
          onSubmit,
          onInvalidDetails: () => onNavigateToTab?.('details'),
          onBack,
          onCancel,
        })
      }
    />
  )
}

function LocationGenericCreateForm(props: LocationCreateFormBodyProps) {
  const { campaignId, fixedCreate, optionsCtx, chrome } = props
  if (!chrome) {
    throw new Error('LocationGenericCreateForm requires chrome.')
  }
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
      chrome={chrome}
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
  const { campaignId, fixedCreate, optionsCtx, chrome } = props
  if (!chrome) {
    throw new Error('LocationSettlementCreateForm requires chrome.')
  }
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
      chrome={chrome}
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
