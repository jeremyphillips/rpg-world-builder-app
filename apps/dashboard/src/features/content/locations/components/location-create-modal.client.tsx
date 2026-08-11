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
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  buildLocationCreateSetupSets,
  type LocationCreateSetupChoiceSet,
} from '../lib/location-create-setup.lib'
import { CreateSetupPanel } from '@/lib/create-setup'
import { LocationCreateSetupSummary } from './location-create-setup-summary.client'
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
        {showDetails && hadSetup && setupModel ? (
          <LocationCreateSetupSummary entries={setupModel.summaryEntries} onChange={onBack} />
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
