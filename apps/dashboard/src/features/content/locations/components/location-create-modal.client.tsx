'use client'

import * as React from 'react'
import { Button, Modal, usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot, FormShellSubmitButton } from '@rpg/ui/form'

import {
  CreateSetupFooter,
  notifyCreateSetupValueChangeCompletion,
  type SetupSummaryEditTarget,
} from '@/lib/create-setup'
import {
  CreateModalShell,
  STANDALONE_CONTENT_CREATE_CONTEXT,
  type ContentCreateContext,
  type CreateCompositionChildWorkflowView,
  type CreateModalShellTab,
  type CreateWorkflowPanelStatus,
  type OnContentCreated,
  resolveActiveCreateTabId,
} from '@/lib/create-flow'

import type {
  ContentFormHostChrome,
  ContentFormHostLeaveBridge,
} from '../../lib/forms/shells/content-form-host.client'
import { ContentFormOptionsGate } from '../../lib/forms/shells/content-form-shell-layout'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { formatContentCreateActionLabel } from '../../lib/content-type-labels'
import {
  completeLocationCreateSetup,
  resolveLocationCreateSession,
  type LocationCreateIntent,
} from '../lib/create/session/location-create-session'
import type { LocationFixedCreateContext } from '../lib/location-form-ctx'
import { formatLocationFixedCreateHeading } from '../lib/create/location-create-shortcuts'
import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  resolveLocationCreateModalSetupModel,
  isLocationCreateModalSetupComplete,
  type LocationCreateModalSetupModel,
  type LocationCreateModalSetupValues,
} from '../lib/create/setup/location-create-modal-setup.lib'
import { type BuildingCreateSetupProjection } from '../lib/create/setup/location-building-create-setup.lib'
import {
  EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  resolveBuildingCreateTransactionSummary,
  type BuildingOrganizationDraftPlan,
} from '../lib/building-organizations/building-organization-create-drafts'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/create/setup/location-create-setup-chrome.lib'
import { buildLocationCreateSetupSets } from '../lib/create/setup/location-create-setup.lib'
import {
  resolveLocationSetupSummaryRows,
  type LocationSetupSummaryEntry,
} from '../lib/create/setup/location-setup-summary-rows.lib'
import {
  LocationCreateModalSetupPanel,
  useLocationCreateModalSetupSequence,
} from './location-create-modal-setup-panel.client'
import {
  resolveLocationCreateAuthoringCapabilities,
  type LocationCreateAuthoringTabId,
} from '../lib/create/location-create-authoring-capabilities.lib'
import { LocationCreateForm } from './location-create-form.client'
import {
  BuildingOrganizationsCreateTab,
  type BuildingOrganizationsCreateTabController,
} from './building-organizations-create-tab.client'

export type LocationCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  campaignId: string
  /** Semantic reason for create — drives authoring capability suppression. */
  createContext?: ContentCreateContext
  /** Optional preloaded context for embedded/test surfaces; normal app usage resolves it here. */
  formOptionsCtx?: ContentFormCtx
  /** Called after persistence and caller handoff succeed. */
  onCreated?: OnContentCreated
}

type LocationCreateModalPhase = 'setup' | 'details'

type LocationCreateModalState = {
  phase: LocationCreateModalPhase
  hadSetup: boolean
  fixedCreate: LocationFixedCreateContext | null
  detailsMounted: boolean
  setupValues: LocationCreateModalSetupValues
  formKey: string
  buildingSetupApplication: {
    revision: number
    projection: BuildingCreateSetupProjection
  } | null
}

function createInitialState(intent: LocationCreateIntent): LocationCreateModalState {
  const session = resolveLocationCreateSession(intent)
  const formKey = `location-create-modal-${intent.authoringType}-${intent.parentLocationId ?? 'overview'}`
  const emptySetup = { ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES }

  if (session.status === 'needsSetup') {
    return {
      phase: 'setup',
      hadSetup: true,
      fixedCreate: null,
      detailsMounted: false,
      setupValues: emptySetup,
      formKey,
      buildingSetupApplication: null,
    }
  }

  return {
    phase: 'details',
    hadSetup: false,
    fixedCreate: session.fixedCreate,
    detailsMounted: true,
    setupValues: emptySetup,
    formKey,
    buildingSetupApplication: null,
  }
}

function resolveModalHeadline({
  phase,
  setupModel,
  fixedCreate,
}: {
  phase: LocationCreateModalPhase
  setupModel: LocationCreateModalSetupModel | null
  fixedCreate: LocationFixedCreateContext | null
}): string {
  if (phase === 'setup') return setupModel?.headline ?? 'Create location'
  if (fixedCreate) return formatLocationFixedCreateHeading(fixedCreate)
  return 'Create location'
}

const MULTI_SETUP_EYEBROW = 'Setup' as const

function resolveAuthoringSetupSummary(
  entries: readonly LocationSetupSummaryEntry[],
): { eyebrow: string; rows: ReturnType<typeof resolveLocationSetupSummaryRows> } | null {
  const rows = resolveLocationSetupSummaryRows(entries)
  if (rows.length === 0) return null

  return {
    eyebrow: rows.length === 1 ? rows[0]!.label : MULTI_SETUP_EYEBROW,
    rows,
  }
}

function buildDetailsChrome({
  hadSetup,
  pending,
  submitLabel,
  onBack,
  onCancel,
}: {
  hadSetup: boolean
  pending: boolean
  submitLabel: string
  onBack: () => void
  onCancel: () => void
}): ContentFormHostChrome {
  return {
    contentWrapper: (content) => content,
    footer: () => (
      <>
        {hadSetup ? (
          <Button type="button" variant="outline" disabled={pending} onClick={onBack}>
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <FormShellSubmitButton disabled={pending}>{submitLabel}</FormShellSubmitButton>
      </>
    ),
  }
}

function resolveCreateWorkflowPanelBlocksSubmit(status: CreateWorkflowPanelStatus): boolean {
  return status.blocksSubmit ?? status.invalid
}

function CreateCompositionChildFooter({
  childWorkflow,
  organizationsControllerRef,
  pending,
}: {
  childWorkflow: NonNullable<CreateCompositionChildWorkflowView>
  organizationsControllerRef: React.MutableRefObject<BuildingOrganizationsCreateTabController | null>
  pending: boolean
}) {
  return (
    <Modal.FooterActions>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => organizationsControllerRef.current?.cancelComposer()}
      >
        Cancel
      </Button>
      {childWorkflow.commitTarget.kind === 'form' ? (
        <Button
          type="submit"
          form={childWorkflow.commitTarget.formId}
          disabled={pending || !childWorkflow.canCommit}
        >
          {childWorkflow.commitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          disabled={pending || !childWorkflow.canCommit}
          onClick={() => organizationsControllerRef.current?.commitComposer()}
        >
          {childWorkflow.commitLabel}
        </Button>
      )}
    </Modal.FooterActions>
  )
}

function buildBuildingShellTabs({
  capabilities,
  campaignId,
  formOptionsCtx,
  renderDetailsForm,
  organizationsTabContent,
  organizationsStatus,
  detailsStatus,
  childWorkflowActive,
}: {
  capabilities: ReturnType<typeof resolveLocationCreateAuthoringCapabilities>
  campaignId: string
  formOptionsCtx?: ContentFormCtx
  renderDetailsForm: (optionsCtx: ContentFormCtx) => React.ReactNode
  organizationsTabContent: React.ReactNode
  organizationsStatus: CreateWorkflowPanelStatus
  detailsStatus: CreateWorkflowPanelStatus
  childWorkflowActive: boolean
}): [CreateModalShellTab, ...CreateModalShellTab[]] {
  const tabDefinitions: Record<LocationCreateAuthoringTabId, () => CreateModalShellTab> = {
    details: () => ({
      id: 'details',
      label: 'Details',
      disabled: childWorkflowActive,
      content: formOptionsCtx ? (
        renderDetailsForm(formOptionsCtx)
      ) : (
        <ContentFormOptionsGate campaignId={campaignId}>{renderDetailsForm}</ContentFormOptionsGate>
      ),
      status: detailsStatus,
      contentMode: 'managed',
    }),
    organizations: () => ({
      id: 'organizations',
      label: 'Organizations',
      content: organizationsTabContent,
      status: organizationsStatus,
    }),
  }

  return capabilities.tabs.map((tabId) => tabDefinitions[tabId]()) as [
    CreateModalShellTab,
    ...CreateModalShellTab[],
  ]
}

function LocationCreateModalDetailsForm({
  fixedCreate,
  campaignId,
  optionsCtx,
  open,
  leaveBridgeRef,
  formKey,
  showDetails,
  hadSetup,
  submitLabel,
  onBack,
  onCancel,
  onTrustedClose,
  onPendingChange,
  buildingSetupApplication,
  extraUnsavedEdits,
  organizationsControllerRef,
  onNavigateToTab,
  onDetailsStatusChange,
  useCompositeBuildingChrome,
  submitBlocked,
  onCreated,
}: {
  fixedCreate: LocationFixedCreateContext
  campaignId: string
  optionsCtx: ContentFormCtx
  open: boolean
  leaveBridgeRef: React.MutableRefObject<ContentFormHostLeaveBridge | null>
  formKey: string
  showDetails: boolean
  hadSetup: boolean
  submitLabel: string
  onBack: () => void
  onCancel: () => void
  onTrustedClose: () => void
  onPendingChange?: (pending: boolean) => void
  buildingSetupApplication: LocationCreateModalState['buildingSetupApplication']
  extraUnsavedEdits?: boolean
  organizationsControllerRef?: React.MutableRefObject<BuildingOrganizationsCreateTabController | null>
  onNavigateToTab?: (tabId: string) => void
  onDetailsStatusChange?: (status: CreateWorkflowPanelStatus) => void
  useCompositeBuildingChrome?: boolean
  submitBlocked?: boolean
  onCreated?: OnContentCreated
}) {
  return (
    <LocationCreateForm
      fixedCreate={fixedCreate}
      campaignId={campaignId}
      optionsCtx={optionsCtx}
      mounted
      leaveGuardEnabled={open}
      leaveBridgeRef={leaveBridgeRef}
      formKey={formKey}
      visible={showDetails}
      onTrustedClose={onTrustedClose}
      onPendingChange={onPendingChange}
      extraUnsavedEdits={extraUnsavedEdits}
      hadSetup={hadSetup}
      onBack={onBack}
      onCancel={onCancel}
      buildingSetupApplication={buildingSetupApplication ?? undefined}
      organizationsControllerRef={organizationsControllerRef}
      onNavigateToTab={onNavigateToTab}
      onDetailsStatusChange={onDetailsStatusChange}
      submitBlocked={submitBlocked}
      submitLabel={submitLabel}
      onCreated={onCreated}
      chrome={
        useCompositeBuildingChrome
          ? undefined
          : ({ pending }) =>
              buildDetailsChrome({
                hadSetup,
                pending,
                submitLabel,
                onBack,
                onCancel,
              })
      }
    />
  )
}

function useLocationCreateModalController({
  intent,
  onOpenChange,
}: {
  intent: LocationCreateIntent
  onOpenChange: (open: boolean) => void
}) {
  const [state, setState] = React.useState(() => createInitialState(intent))
  const [detailsPending, setDetailsPending] = React.useState(false)
  const leaveBridgeRef = React.useRef<ContentFormHostLeaveBridge | null>(null)
  const { trustedClose } = usePendingAwareOpenChange({
    pending: detailsPending,
    onOpenChange,
  })

  const setupModel = state.hadSetup
    ? resolveLocationCreateModalSetupModel({ intent, values: state.setupValues })
    : null

  const requestClose = React.useCallback(() => {
    if (detailsPending) return
    const bridge = leaveBridgeRef.current
    if (bridge) {
      bridge.requestClose(trustedClose)
      return
    }
    trustedClose()
  }, [detailsPending, trustedClose])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      requestClose()
    },
    [onOpenChange, requestClose],
  )

  const handleContinueFromSetup = React.useCallback(
    (values: LocationCreateModalSetupValues = state.setupValues) => {
      const model = resolveLocationCreateModalSetupModel({ intent, values })
      if (!model || !isLocationCreateModalSetupComplete(model)) return
      const result = model.complete()
      if (!result) return
      const fixedCreate = completeLocationCreateSetup(intent, result)
      setState((current) => ({
        ...current,
        phase: 'details',
        setupValues: values,
        fixedCreate,
        detailsMounted: true,
        buildingSetupApplication:
          result.kind === 'building'
            ? {
                revision: (current.buildingSetupApplication?.revision ?? 0) + 1,
                projection: {
                  ...(result.form ? { form: result.form } : {}),
                  ...(result.facilityAuthoringGroup
                    ? { facilityAuthoringGroup: result.facilityAuthoringGroup }
                    : {}),
                },
              }
            : current.buildingSetupApplication,
      }))
    },
    [intent, state.setupValues],
  )

  const handleBackToSetup = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'setup',
    }))
  }, [])

  const returnToDetailsPhase = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'details',
    }))
  }, [])

  const handleSetupValueChange = React.useCallback(
    (event: Parameters<typeof applyLocationCreateModalSetupValueChange>[0]['event']) => {
      const previousModel = resolveLocationCreateModalSetupModel({
        intent,
        values: state.setupValues,
      })
      const previousSets = previousModel
        ? buildLocationCreateSetupSets(previousModel.choiceSets)
        : []

      const nextValues = applyLocationCreateModalSetupValueChange({
        values: state.setupValues,
        event,
      })
      const nextModel = resolveLocationCreateModalSetupModel({ intent, values: nextValues })
      const nextSets = nextModel ? buildLocationCreateSetupSets(nextModel.choiceSets) : []

      notifyCreateSetupValueChangeCompletion({
        previousSets,
        nextSets,
        onSetupComplete: () => handleContinueFromSetup(nextValues),
      })

      setState((current) => ({
        ...current,
        setupValues: nextValues,
      }))
    },
    [handleContinueFromSetup, intent, state.setupValues],
  )

  const setupSets = setupModel ? buildLocationCreateSetupSets(setupModel.choiceSets) : []

  return {
    state,
    setupModel,
    leaveBridgeRef,
    setupSets,
    handleSetupValueChange,
    requestClose,
    handleOpenChange,
    handleContinueFromSetup,
    handleBackToSetup,
    returnToDetailsPhase,
    detailsPending,
    setDetailsPending,
    trustedClose,
  }
}

function resolveSetupPhaseHeader(args: {
  phase: LocationCreateModalPhase
  setupModel: LocationCreateModalSetupModel | null
}): { description?: string; clearAriaDescribedBy: boolean } {
  if (args.phase !== 'setup') return { clearAriaDescribedBy: false }
  const description =
    typeof args.setupModel?.subhead === 'string' ? args.setupModel.subhead : undefined
  return { description, clearAriaDescribedBy: description == null }
}

// Orchestrator: setup ↔ details chrome; complexity is structural wiring, not logic density.
// fallow-ignore-next-line complexity
function LocationCreateModalSession({
  open,
  onOpenChange,
  intent,
  campaignId,
  createContext = STANDALONE_CONTENT_CREATE_CONTEXT,
  formOptionsCtx,
  onCreated,
}: LocationCreateModalProps) {
  const {
    state,
    setupModel,
    leaveBridgeRef,
    setupSets,
    handleSetupValueChange,
    requestClose,
    handleOpenChange,
    handleContinueFromSetup,
    handleBackToSetup,
    returnToDetailsPhase,
    detailsPending,
    setDetailsPending,
    trustedClose,
  } = useLocationCreateModalController({ intent, onOpenChange })
  const [requestedTabId, setRequestedTabId] = React.useState('details')
  const [detailsStatus, setDetailsStatus] = React.useState<CreateWorkflowPanelStatus>({
    invalid: false,
    dirty: false,
  })
  const [organizationsStatus, setOrganizationsStatus] = React.useState<CreateWorkflowPanelStatus>({
    invalid: false,
    dirty: false,
  })
  const organizationsControllerRef = React.useRef<BuildingOrganizationsCreateTabController | null>(
    null,
  )
  const [organizationDraftPlan, setOrganizationDraftPlan] = React.useState(
    EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  )
  const [childWorkflow, setChildWorkflow] = React.useState<CreateCompositionChildWorkflowView>(null)
  const pendingSetupSummaryEditRef = React.useRef<SetupSummaryEditTarget | null>(null)

  const handleOrganizationPlanChange = React.useCallback((plan: BuildingOrganizationDraftPlan) => {
    setOrganizationDraftPlan(plan)
  }, [])

  const handleChildWorkflowChange = React.useCallback(
    (view: CreateCompositionChildWorkflowView) => {
      setChildWorkflow(view)
    },
    [],
  )

  const showDetails = state.phase === 'details' && state.fixedCreate != null
  const buildingDetailsReady =
    state.detailsMounted &&
    state.fixedCreate?.authoringType === 'building' &&
    state.buildingSetupApplication != null
  const capabilities =
    state.fixedCreate != null
      ? resolveLocationCreateAuthoringCapabilities({
          authoringType: state.fixedCreate.authoringType,
          createContext,
        })
      : null
  const useBuildingShellTabs = buildingDetailsReady && capabilities != null
  const organizationComposition = capabilities?.organizationComposition ?? false
  const activeTabId = resolveActiveCreateTabId(capabilities?.tabs ?? [], requestedTabId, 'details')

  const showSetup = state.phase === 'setup' && setupModel != null
  const setupSequenceModel = useLocationCreateModalSetupSequence({
    sets: setupSets,
    onSetupComplete: () => handleContinueFromSetup(state.setupValues),
  })

  const returnToDetails = React.useCallback(() => {
    returnToDetailsPhase()
  }, [returnToDetailsPhase])

  const handleSetupSummaryEdit = React.useCallback(
    (target: SetupSummaryEditTarget) => {
      pendingSetupSummaryEditRef.current = target
      handleBackToSetup()
    },
    [handleBackToSetup],
  )

  React.useLayoutEffect(() => {
    if (state.phase !== 'setup') return

    const pending = pendingSetupSummaryEditRef.current
    if (!pending) return

    pendingSetupSummaryEditRef.current = null
    if (pending.type === 'set') {
      setupSequenceModel.reopen(pending.id, { onDismiss: returnToDetails })
    }
  }, [returnToDetails, setupSequenceModel, state.phase])

  const submitLabel =
    state.fixedCreate?.authoringType === 'building'
      ? resolveBuildingCreateTransactionSummary(organizationDraftPlan).submitLabel
      : formatContentCreateActionLabel('locations')
  const childWorkflowActive = childWorkflow?.active === true
  const setupHeader = resolveSetupPhaseHeader({ phase: state.phase, setupModel })
  const buildingSubmitBlocked =
    organizationComposition &&
    (resolveCreateWorkflowPanelBlocksSubmit(detailsStatus) ||
      resolveCreateWorkflowPanelBlocksSubmit(organizationsStatus))
  const renderDetailsForm = (optionsCtx: ContentFormCtx) => (
    <LocationCreateModalDetailsForm
      fixedCreate={state.fixedCreate!}
      campaignId={campaignId}
      optionsCtx={optionsCtx}
      open={open}
      leaveBridgeRef={leaveBridgeRef}
      formKey={state.formKey}
      showDetails={showDetails && (!useBuildingShellTabs || activeTabId === 'details')}
      hadSetup={state.hadSetup}
      submitLabel={submitLabel}
      onBack={handleBackToSetup}
      onCancel={requestClose}
      onTrustedClose={trustedClose}
      onPendingChange={setDetailsPending}
      buildingSetupApplication={state.buildingSetupApplication}
      extraUnsavedEdits={organizationComposition ? organizationsStatus.dirty : undefined}
      organizationsControllerRef={organizationComposition ? organizationsControllerRef : undefined}
      onNavigateToTab={organizationComposition ? setRequestedTabId : undefined}
      onDetailsStatusChange={useBuildingShellTabs ? setDetailsStatus : undefined}
      useCompositeBuildingChrome={organizationComposition}
      submitBlocked={buildingSubmitBlocked || undefined}
      onCreated={onCreated}
    />
  )
  const resolvedSetupSummary = setupModel
    ? resolveAuthoringSetupSummary(setupModel.summaryEntries)
    : null
  const setupSummary =
    showDetails && state.hadSetup && resolvedSetupSummary
      ? {
          eyebrow: resolvedSetupSummary.eyebrow,
          rows: resolvedSetupSummary.rows,
          changeLabel: LOCATION_CREATE_SETUP_CHANGE_LABEL,
          onRowEdit: handleSetupSummaryEdit,
        }
      : undefined
  const organizationsTabContent = (
    <BuildingOrganizationsCreateTab
      campaignId={campaignId}
      formCtx={formOptionsCtx}
      controllerRef={organizationsControllerRef}
      onStatusChange={setOrganizationsStatus}
      onPlanChange={handleOrganizationPlanChange}
      onChildWorkflowChange={handleChildWorkflowChange}
    />
  )

  return (
    <FormShellFooterScope>
      <CreateModalShell
        open={open}
        onOpenChange={handleOpenChange}
        headline={resolveModalHeadline({
          phase: state.phase,
          setupModel,
          fixedCreate: state.fixedCreate,
        })}
        description={setupHeader.description}
        setupSummary={setupSummary}
        contentMode={showSetup ? 'scroll' : 'managed'}
        activeTabId={useBuildingShellTabs ? activeTabId : undefined}
        onActiveTabChange={useBuildingShellTabs ? setRequestedTabId : undefined}
        tabsVisible={showDetails}
        tabs={
          useBuildingShellTabs && capabilities
            ? buildBuildingShellTabs({
                capabilities,
                campaignId,
                formOptionsCtx,
                renderDetailsForm,
                organizationsTabContent,
                organizationsStatus,
                detailsStatus,
                childWorkflowActive,
              })
            : undefined
        }
        footer={
          showSetup ? (
            <CreateSetupFooter
              model={setupSequenceModel}
              onCancel={requestClose}
              onSetupComplete={() => handleContinueFromSetup(state.setupValues)}
            />
          ) : childWorkflowActive && childWorkflow ? (
            <CreateCompositionChildFooter
              childWorkflow={childWorkflow}
              organizationsControllerRef={organizationsControllerRef}
              pending={detailsPending}
            />
          ) : (
            <FormShellFooterSlot />
          )
        }
      >
        {showSetup ? (
          <LocationCreateModalSetupPanel
            sets={setupSets}
            model={setupSequenceModel}
            onSetupValueChange={handleSetupValueChange}
          />
        ) : null}

        {!useBuildingShellTabs && state.detailsMounted && state.fixedCreate ? (
          formOptionsCtx ? (
            renderDetailsForm(formOptionsCtx)
          ) : (
            <ContentFormOptionsGate campaignId={campaignId}>
              {renderDetailsForm}
            </ContentFormOptionsGate>
          )
        ) : null}
      </CreateModalShell>
    </FormShellFooterScope>
  )
}

/**
 * Continuous location create modal (setup ↔ details). Modal owns create chrome;
 * drawers remain for focused edits.
 */
export function LocationCreateModal(props: LocationCreateModalProps) {
  if (!props.open) return null
  return (
    <LocationCreateModalSession
      key={JSON.stringify({ intent: props.intent, createContext: props.createContext })}
      {...props}
    />
  )
}
