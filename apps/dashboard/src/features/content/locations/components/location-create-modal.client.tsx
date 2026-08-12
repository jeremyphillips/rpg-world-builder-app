'use client'

import * as React from 'react'
import {
  Button,
  DialogPanelActionRow,
  Modal,
  cn,
  dialogPanelSectionInsetXClasses,
  usePendingAwareOpenChange,
} from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot, FormShellSubmitButton } from '@rpg/ui/form'

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
import type { BuildingCreateSetupProjection } from '../lib/location-building-create-setup.lib'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  buildLocationCreateSetupSets,
  type LocationCreateSetupChoiceSet,
} from '../lib/location-create-setup.lib'
import { CreateSetupPanel, CreateSetupSummary } from '@/lib/create-setup'
import { LocationCreateForm } from './location-create-form.client'

export type LocationCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  campaignId: string
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

function LocationCreateModalSetupPhase({
  choiceSets,
  reopenChoiceSetId,
  onReopenChoiceSetIdChange,
  canContinue,
  onContinue,
  onCancel,
}: {
  choiceSets: LocationCreateSetupChoiceSet[]
  reopenChoiceSetId: string | null
  onReopenChoiceSetIdChange: (choiceSetId: string | null) => void
  canContinue: boolean
  onContinue: () => void
  onCancel: () => void
}) {
  return (
    <>
      <Modal.Body>
        <CreateSetupPanel
          sets={buildLocationCreateSetupSets(choiceSets)}
          changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
          reopenSetId={reopenChoiceSetId}
          onReopenSetIdChange={onReopenChoiceSetIdChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <DialogPanelActionRow>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={!canContinue} onClick={onContinue}>
            Continue
          </Button>
        </DialogPanelActionRow>
      </Modal.Footer>
    </>
  )
}

function buildDetailsChrome({
  showDetails,
  hadSetup,
  setupModel,
  pending,
  submitLabel,
  onBack,
  onCancel,
}: {
  showDetails: boolean
  hadSetup: boolean
  setupModel: LocationCreateModalSetupModel | null
  pending: boolean
  submitLabel: string
  onBack: () => void
  onCancel: () => void
}): ContentFormHostChrome {
  const setupSummary = setupModel ? resolveSetupSummary(setupModel.summaryEntries) : null

  return {
    contentWrapper: (content) => (
      <Modal.Body
        className={cn(
          dialogPanelSectionInsetXClasses,
          'flex flex-col gap-4 pt-0',
          !showDetails && 'hidden',
        )}
        aria-hidden={!showDetails}
      >
        {showDetails && hadSetup && setupSummary ? (
          <CreateSetupSummary
            eyebrow={setupSummary.eyebrow}
            summary={setupSummary.summary}
            changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
            onChange={onBack}
          />
        ) : null}
        {content}
      </Modal.Body>
    ),
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

function LocationCreateModalDetailsForm({
  fixedCreate,
  campaignId,
  optionsCtx,
  open,
  leaveBridgeRef,
  formKey,
  showDetails,
  hadSetup,
  setupModel,
  submitLabel,
  onBack,
  onCancel,
  onTrustedClose,
  onPendingChange,
  buildingSetupApplication,
  onBuildingClassificationChange,
}: {
  fixedCreate: LocationFixedCreateContext
  campaignId: string
  optionsCtx: ContentFormCtx
  open: boolean
  leaveBridgeRef: React.MutableRefObject<ContentFormHostLeaveBridge | null>
  formKey: string
  showDetails: boolean
  hadSetup: boolean
  setupModel: LocationCreateModalSetupModel | null
  submitLabel: string
  onBack: () => void
  onCancel: () => void
  onTrustedClose: () => void
  onPendingChange?: (pending: boolean) => void
  buildingSetupApplication: LocationCreateModalState['buildingSetupApplication']
  onBuildingClassificationChange: NonNullable<
    React.ComponentProps<typeof LocationCreateForm>['onBuildingClassificationChange']
  >
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
      buildingSetupApplication={buildingSetupApplication ?? undefined}
      onBuildingClassificationChange={onBuildingClassificationChange}
      chrome={({ pending }) =>
        buildDetailsChrome({
          showDetails,
          hadSetup,
          setupModel,
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
                ...(result.facilityType ? { facilityType: result.facilityType } : {}),
                operatorIntent: result.operatorIntent,
              },
            }
          : current.buildingSetupApplication,
    }))
  }, [intent, setupModel])

  const handleBuildingClassificationChange = React.useCallback(
    (classification: {
      form?: BuildingCreateSetupProjection['form']
      facilityType?: BuildingCreateSetupProjection['facilityType']
    }) => {
      setState((current) => ({
        ...current,
        setupValues: {
          ...current.setupValues,
          buildingForm: classification.form ?? '',
          buildingFacilityType: classification.facilityType ?? '',
        },
      }))
    },
    [],
  )

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
    handleBuildingClassificationChange,
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
    handleBuildingClassificationChange,
    trustedClose,
  } = useLocationCreateModalController({ intent, onOpenChange })

  const showDetails = state.phase === 'details' && state.fixedCreate != null
  const showSetup = state.phase === 'setup' && setupModel != null
  const submitLabel = formatContentCreateActionLabel('locations')
  const setupHeader = resolveSetupPhaseHeader({ phase: state.phase, setupModel })

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content
        size="md"
        closeOnOutsideClick={false}
        {...(setupHeader.clearAriaDescribedBy ? { 'aria-describedby': undefined } : {})}
      >
        <Modal.Header
          headline={resolveModalHeadline({
            phase: state.phase,
            setupModel,
            fixedCreate: state.fixedCreate,
          })}
          description={setupHeader.description}
        />

        {showSetup ? (
          <LocationCreateModalSetupPhase
            choiceSets={choiceSets}
            reopenChoiceSetId={state.reopenChoiceSetId}
            onReopenChoiceSetIdChange={setReopenChoiceSetId}
            canContinue={Boolean(setupModel?.canContinue)}
            onContinue={handleContinueFromSetup}
            onCancel={requestClose}
          />
        ) : null}

        {state.detailsMounted && state.fixedCreate ? (
          <FormShellFooterScope>
            <ContentFormOptionsGate campaignId={campaignId}>
              {(optionsCtx) => (
                <LocationCreateModalDetailsForm
                  fixedCreate={state.fixedCreate!}
                  campaignId={campaignId}
                  optionsCtx={optionsCtx}
                  open={open}
                  leaveBridgeRef={leaveBridgeRef}
                  formKey={state.formKey}
                  showDetails={showDetails}
                  hadSetup={state.hadSetup}
                  setupModel={setupModel}
                  submitLabel={submitLabel}
                  onBack={handleBackToSetup}
                  onCancel={requestClose}
                  onTrustedClose={trustedClose}
                  onPendingChange={setDetailsPending}
                  buildingSetupApplication={state.buildingSetupApplication}
                  onBuildingClassificationChange={handleBuildingClassificationChange}
                />
              )}
            </ContentFormOptionsGate>
            <Modal.Footer className={cn(!showDetails && 'hidden')} aria-hidden={!showDetails}>
              <FormShellFooterSlot />
            </Modal.Footer>
          </FormShellFooterScope>
        ) : null}
      </Modal.Content>
    </Modal.Root>
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
