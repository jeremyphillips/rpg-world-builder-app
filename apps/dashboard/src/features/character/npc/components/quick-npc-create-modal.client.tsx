'use client'

import * as React from 'react'

import type { CampaignNpcDetail, CharacterBuildContext } from '@rpg/contracts'
import { Button, Modal, dialogPanelActionRowClasses, usePendingAwareOpenChange } from '@rpg/ui'

import { CreateSetupPanel } from '@/lib/create-setup'

import {
  EMPTY_QUICK_NPC_SETUP_VALUES,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import {
  buildQuickNpcCreateSetupSets,
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_HEADLINE,
  resolveQuickNpcSetupModel,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  QuickNpcAuthoringForm,
  type QuickNpcCreateFormOrganization,
} from './quick-npc-authoring-form.client'

export type { QuickNpcCreateFormOrganization }

export const QUICK_NPC_CREATE_TITLE = QUICK_NPC_SETUP_HEADLINE

export type QuickNpcCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  /** Called when the user dismisses authoring — parent should restore the add drawer. */
  onCancel: () => void
  onCreated: (npc: CampaignNpcDetail) => void | Promise<void>
}

type QuickNpcCreateModalPhase = 'setup' | 'authoring'

type QuickNpcCreateModalState = {
  phase: QuickNpcCreateModalPhase
  setupValues: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabValues>
}

function createInitialState(): QuickNpcCreateModalState {
  return {
    phase: 'setup',
    setupValues: { ...EMPTY_QUICK_NPC_SETUP_VALUES },
  }
}

function QuickNpcCreateModalSetupPhase({
  buildContext,
  setupValues,
  onSetupValuesChange,
  onContinue,
  onCancel,
}: {
  buildContext: CharacterBuildContext
  setupValues: QuickNpcSetupValues
  onSetupValuesChange: (values: QuickNpcSetupValues) => void
  onContinue: (values: QuickNpcSetupValues) => void
  onCancel: () => void
}) {
  const setupSets = React.useMemo(
    () =>
      buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: setupValues,
        onValuesChange: onSetupValuesChange,
      }),
    [buildContext, setupValues, onSetupValuesChange],
  )
  const setupModel = React.useMemo(
    () => resolveQuickNpcSetupModel({ context: buildContext, values: setupValues }),
    [buildContext, setupValues],
  )

  return (
    <>
      <Modal.Body>
        <CreateSetupPanel sets={setupSets} changeLabel={QUICK_NPC_SETUP_CHANGE_LABEL} />
      </Modal.Body>
      <Modal.Footer>
        <div className={dialogPanelActionRowClasses}>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!setupModel.canContinue}
            onClick={() => {
              if (!setupModel.canContinue) return
              onContinue(setupValues)
            }}
          >
            Continue
          </Button>
        </div>
      </Modal.Footer>
    </>
  )
}

function QuickNpcCreateModalSession({
  open,
  onOpenChange,
  campaignId,
  buildContext,
  organization,
  onCancel,
  onCreated,
}: QuickNpcCreateModalProps) {
  const [state, setState] = React.useState(createInitialState)
  const [authoringPending, setAuthoringPending] = React.useState(false)
  const { trustedClose } = usePendingAwareOpenChange({
    pending: authoringPending,
    onOpenChange,
  })

  const setupModel = React.useMemo(
    () => resolveQuickNpcSetupModel({ context: buildContext, values: state.setupValues }),
    [buildContext, state.setupValues],
  )

  const requestCancel = React.useCallback(() => {
    if (authoringPending) return
    onCancel()
  }, [authoringPending, onCancel])

  const handleDismiss = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      requestCancel()
    },
    [onOpenChange, requestCancel],
  )

  const handleSetupValuesChange = React.useCallback((setupValues: QuickNpcSetupValues) => {
    setState((current) => ({ ...current, setupValues }))
  }, [])

  const handleContinueFromSetup = React.useCallback((values: QuickNpcSetupValues) => {
    setState((current) => ({
      ...current,
      phase: 'authoring',
      setupValues: values,
      authoringValues: {
        requiredWeaponIds: [],
        requiredSpellIds: [],
      },
    }))
  }, [])

  const handleChangeSetup = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'setup',
      authoringValues: {
        ...current.authoringValues,
        requiredWeaponIds: [],
        requiredSpellIds: [],
      },
    }))
  }, [])

  const handleAuthoringCreated = React.useCallback(
    async (npc: CampaignNpcDetail) => {
      await onCreated(npc)
      trustedClose()
    },
    [onCreated, trustedClose],
  )

  return (
    <Modal.Root open={open} onOpenChange={handleDismiss}>
      <Modal.Content size="md" layout="stable" closeOnOutsideClick={false}>
        <Modal.Header
          headline={QUICK_NPC_CREATE_TITLE}
          description={
            state.phase === 'setup'
              ? `Choose species, class, and level for a new member of ${organization.name}.`
              : `Create a new NPC as a member of ${organization.name}.`
          }
        />

        {state.phase === 'setup' ? (
          <QuickNpcCreateModalSetupPhase
            buildContext={buildContext}
            setupValues={state.setupValues}
            onSetupValuesChange={handleSetupValuesChange}
            onContinue={handleContinueFromSetup}
            onCancel={requestCancel}
          />
        ) : (
          <>
            <Modal.Body stableBody className="pt-0">
              <QuickNpcAuthoringForm
                key={`${state.setupValues.speciesId}:${state.setupValues.classId}:${state.setupValues.level}`}
                campaignId={campaignId}
                buildContext={buildContext}
                organization={organization}
                setup={state.setupValues}
                setupSummary={setupModel.summaryEntries}
                initialValues={state.authoringValues}
                onCancel={requestCancel}
                onChangeSetup={handleChangeSetup}
                onCreated={handleAuthoringCreated}
                onPendingChange={setAuthoringPending}
              />
            </Modal.Body>
            <Modal.Footer className="sr-only" aria-hidden />
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  )
}

/**
 * Quick NPC creation modal — setup then TabbedForm authoring. Cancel/X/Escape during
 * authoring returns to the add-member drawer; success closes all overlays.
 */
export function QuickNpcCreateModal(props: QuickNpcCreateModalProps) {
  if (!props.open) return null
  return <QuickNpcCreateModalSession key={props.organization.id} {...props} />
}
