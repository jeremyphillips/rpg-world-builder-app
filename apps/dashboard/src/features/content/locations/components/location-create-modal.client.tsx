'use client'

import * as React from 'react'
import { Button, DialogPanelActionRow, usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot, FormShellSubmitButton } from '@rpg/ui/form'

import { CreateModalShell, type CreateWorkflowPanelStatus } from '@/lib/create-flow'
import { CreateSetupPanel } from '@/lib/create-setup'

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
} from '../lib/location-create-session'
import type { LocationFixedCreateContext } from '../lib/location-form-ctx'
import { formatLocationFixedCreateHeading } from '../lib/location-create-shortcuts'
import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  resolveLocationCreateModalSetupModel,
  type LocationCreateModalSetupModel,
  type LocationCreateModalSetupValues,
} from '../lib/location-create-modal-setup.lib'
import {
  BUILDING_CREATE_SETUP_HEADLINE,
  type BuildingCreateSetupProjection,
} from '../lib/location-building-create-setup.lib'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  buildLocationCreateSetupSets,
  type LocationCreateSetupChoiceSet,
} from '../lib/location-create-setup.lib'
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
  /** Optional preloaded context for embedded/test surfaces; normal app usage resolves it here. */
  formOptionsCtx?: ContentFormCtx
}

type LocationCreateModalPhase = 'setup' | 'details'

type LocationCreateModalState = {
  phase: LocationCreateModalPhase
  hadSetup: boolean
  fixedCreate: LocationFixedCreateContext | null
  detailsMounted: boolean
  setupValues: LocationCreateModalSetupValues
  reopenChoiceSetId: string | null
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
      reopenChoiceSetId: null,
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
    reopenChoiceSetId: null,
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

function LocationCreateModalSetupPanel({
  choiceSets,
  reopenChoiceSetId,
  onReopenChoiceSetIdChange,
}: {
  choiceSets: LocationCreateSetupChoiceSet[]
  reopenChoiceSetId: string | null
  onReopenChoiceSetIdChange: (choiceSetId: string | null) => void
}) {
  return (
    <CreateSetupPanel
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      reopenSetId={reopenChoiceSetId}
      onReopenSetIdChange={onReopenChoiceSetIdChange}
    />
  )
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

const MULTI_SETUP_EYEBROW = 'Setup' as const

function resolveSetupSummary(
  entries: readonly { fieldLabel: string; valueLabel: string }[],
): { eyebrow: string; summary: string } | null {
  const firstEntry = entries[0]
  if (!firstEntry) return null

  if (entries.length === 1) {
    return { eyebrow: firstEntry.fieldLabel, summary: firstEntry.valueLabel }
  }

  return {
    eyebrow: MULTI_SETUP_EYEBROW,
    summary: entries.map((entry) => entry.valueLabel).join(' · '),
  }
}

function resolveCreateWorkflowPanelBlocksSubmit(status: CreateWorkflowPanelStatus): boolean {
  return status.blocksSubmit ?? status.invalid
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

  const handleContinueFromSetup = React.useCallback(() => {
    if (!setupModel?.canContinue) return
    const result = setupModel.complete()
    if (!result) return
    const fixedCreate = completeLocationCreateSetup(intent, result)
    setState((current) => ({
      ...current,
      phase: 'details',
      fixedCreate,
      detailsMounted: true,
      reopenChoiceSetId: null,
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
  }, [intent, setupModel])

  const handleBackToSetup = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'setup',
      reopenChoiceSetId: null,
    }))
  }, [])

  const setReopenChoiceSetId = React.useCallback((choiceSetId: string | null) => {
    setState((current) => ({ ...current, reopenChoiceSetId: choiceSetId }))
  }, [])

  const choiceSets: LocationCreateSetupChoiceSet[] =
    setupModel?.choiceSets.map((choiceSet) => ({
      ...choiceSet,
      onValueChange: (nextValue: string) => {
        setState((current) => ({
          ...current,
          setupValues: applyLocationCreateModalSetupValueChange({
            values: current.setupValues,
            choiceSetId: choiceSet.id,
            nextValue,
          }),
        }))
      },
    })) ?? []

  return {
    state,
    setupModel,
    leaveBridgeRef,
    choiceSets,
    requestClose,
    handleOpenChange,
    handleContinueFromSetup,
    handleBackToSetup,
    setReopenChoiceSetId,
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
  formOptionsCtx,
}: LocationCreateModalProps) {
  const {
    state,
    setupModel,
    leaveBridgeRef,
    choiceSets,
    requestClose,
    handleOpenChange,
    handleContinueFromSetup,
    handleBackToSetup,
    setReopenChoiceSetId,
    setDetailsPending,
    trustedClose,
  } = useLocationCreateModalController({ intent, onOpenChange })
  const [activeTabId, setActiveTabId] = React.useState('details')
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

  const showDetails = state.phase === 'details' && state.fixedCreate != null
  const buildingTabsConfigured =
    state.detailsMounted &&
    state.fixedCreate?.authoringType === 'building' &&
    state.buildingSetupApplication != null
  const showSetup = state.phase === 'setup' && setupModel != null
  const submitLabel = buildingTabsConfigured
    ? BUILDING_CREATE_SETUP_HEADLINE
    : formatContentCreateActionLabel('locations')
  const setupHeader = resolveSetupPhaseHeader({ phase: state.phase, setupModel })
  const buildingSubmitBlocked =
    buildingTabsConfigured &&
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
      showDetails={showDetails && (!buildingTabsConfigured || activeTabId === 'details')}
      hadSetup={state.hadSetup}
      submitLabel={submitLabel}
      onBack={handleBackToSetup}
      onCancel={requestClose}
      onTrustedClose={trustedClose}
      onPendingChange={setDetailsPending}
      buildingSetupApplication={state.buildingSetupApplication}
      extraUnsavedEdits={organizationsStatus.dirty}
      organizationsControllerRef={buildingTabsConfigured ? organizationsControllerRef : undefined}
      onNavigateToTab={buildingTabsConfigured ? setActiveTabId : undefined}
      onDetailsStatusChange={buildingTabsConfigured ? setDetailsStatus : undefined}
      useCompositeBuildingChrome={buildingTabsConfigured}
      submitBlocked={buildingSubmitBlocked || undefined}
    />
  )
  const resolvedSetupSummary = setupModel ? resolveSetupSummary(setupModel.summaryEntries) : null
  const setupSummary =
    showDetails && state.hadSetup && resolvedSetupSummary
      ? {
          ...resolvedSetupSummary,
          changeLabel: LOCATION_CREATE_SETUP_CHANGE_LABEL,
          onChange: handleBackToSetup,
        }
      : undefined

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
        activeTabId={buildingTabsConfigured ? activeTabId : undefined}
        onActiveTabChange={buildingTabsConfigured ? setActiveTabId : undefined}
        tabsVisible={showDetails}
        tabs={
          buildingTabsConfigured
            ? [
                {
                  id: 'details',
                  label: 'Details',
                  content: formOptionsCtx ? (
                    renderDetailsForm(formOptionsCtx)
                  ) : (
                    <ContentFormOptionsGate campaignId={campaignId}>
                      {renderDetailsForm}
                    </ContentFormOptionsGate>
                  ),
                  status: detailsStatus,
                  contentMode: 'managed',
                },
                {
                  id: 'organizations',
                  label: 'Organizations',
                  optional: true,
                  content: (
                    <BuildingOrganizationsCreateTab
                      campaignId={campaignId}
                      formCtx={formOptionsCtx}
                      controllerRef={organizationsControllerRef}
                      onStatusChange={setOrganizationsStatus}
                    />
                  ),
                  status: organizationsStatus,
                },
              ]
            : undefined
        }
        footer={
          showSetup ? (
            <DialogPanelActionRow>
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!setupModel?.canContinue}
                onClick={handleContinueFromSetup}
              >
                Continue
              </Button>
            </DialogPanelActionRow>
          ) : (
            <FormShellFooterSlot />
          )
        }
      >
        {showSetup ? (
          <LocationCreateModalSetupPanel
            choiceSets={choiceSets}
            reopenChoiceSetId={state.reopenChoiceSetId}
            onReopenChoiceSetIdChange={setReopenChoiceSetId}
          />
        ) : null}

        {!buildingTabsConfigured && state.detailsMounted && state.fixedCreate ? (
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
  return <LocationCreateModalSession key={JSON.stringify(props.intent)} {...props} />
}
