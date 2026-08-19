'use client'

import * as React from 'react'

import type { CampaignNpcDetail, CharacterBuildContext } from '@rpg/contracts'
import { usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import {
  CreateSetupFooter,
  notifyCreateSetupValueChangeCompletion,
  useCreateSetupSequence,
  type SetupSummaryEditTarget,
} from '@/lib/create-setup'
import { CreateModalShell } from '@/lib/create-flow'

import {
  createQuickNpcSetupDefaultValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import { applyQuickNpcSetupValueChange } from '../lib/quick-npc-setup-value-change.lib'
import {
  buildQuickNpcCreateSetupSets,
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
  QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  resolveQuickNpcBuildExternalDecision,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  QuickNpcAuthoringForm,
  type QuickNpcCreateFormOrganization,
} from './quick-npc-authoring-form.client'
import { QuickNpcCreateSetupPhase } from './quick-npc-create-setup-phase.client'

export type { QuickNpcCreateFormOrganization }

export const QUICK_NPC_CREATE_TITLE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE

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

function createInitialState(buildContext: CharacterBuildContext): QuickNpcCreateModalState {
  return {
    phase: 'setup',
    setupValues: createQuickNpcSetupDefaultValues(buildContext),
  }
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
  const [state, setState] = React.useState(() => createInitialState(buildContext))
  const [authoringPending, setAuthoringPending] = React.useState(false)
  const pendingSetupSummaryEditRef = React.useRef<SetupSummaryEditTarget | null>(null)
  const setupValuesRef = React.useRef(state.setupValues)
  setupValuesRef.current = state.setupValues
  const { trustedClose } = usePendingAwareOpenChange({
    pending: authoringPending,
    onOpenChange,
  })

  const organizationMembers = organization.members
  const titles = organizationMembers?.titles ?? []
  const classAffinityIds = organizationMembers?.classAffinityIds
  const speciesAffinityIds = organizationMembers?.speciesAffinityIds

  const setupSets = React.useMemo(
    () =>
      buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: state.setupValues,
        titles,
        members: {
          classAffinityIds,
          speciesAffinityIds,
        },
      }),
    [buildContext, classAffinityIds, speciesAffinityIds, state.setupValues, titles],
  )

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

  const externalDecisions = React.useMemo(
    () => [
      resolveQuickNpcBuildExternalDecision({
        values: state.setupValues,
        context: buildContext,
      }),
    ],
    [buildContext, state.setupValues],
  )

  const sequenceModel = useCreateSetupSequence(setupSets, {
    externalDecisions,
    onSetupComplete: () => handleContinueFromSetup(setupValuesRef.current),
  })

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

  const handleSetupValueChange = React.useCallback(
    (event: Parameters<typeof applyQuickNpcSetupValueChange>[0]['event']) => {
      const previousSets = buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: setupValuesRef.current,
        titles,
        members: {
          classAffinityIds,
          speciesAffinityIds,
        },
      })

      const nextValues = applyQuickNpcSetupValueChange({
        values: setupValuesRef.current,
        event,
        context: buildContext,
        titles,
        organizationClassAffinityIds: classAffinityIds,
      })

      const nextSets = buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: nextValues,
        titles,
        members: {
          classAffinityIds,
          speciesAffinityIds,
        },
      })

      const nextExternalDecisions = [
        resolveQuickNpcBuildExternalDecision({
          values: nextValues,
          context: buildContext,
        }),
      ]

      notifyCreateSetupValueChangeCompletion({
        previousSets,
        nextSets,
        externalDecisions: nextExternalDecisions,
        onSetupComplete: () => handleContinueFromSetup(nextValues),
      })

      setState((current) => ({
        ...current,
        setupValues: nextValues,
      }))
    },
    [buildContext, classAffinityIds, handleContinueFromSetup, speciesAffinityIds, titles],
  )

  const returnToAuthoring = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'authoring',
    }))
  }, [])

  const handleSetupSummaryEdit = React.useCallback((target: SetupSummaryEditTarget) => {
    pendingSetupSummaryEditRef.current = target
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

  React.useLayoutEffect(() => {
    if (state.phase !== 'setup') return

    const pending = pendingSetupSummaryEditRef.current
    if (!pending) return

    pendingSetupSummaryEditRef.current = null
    if (pending.type === 'set') {
      sequenceModel.reopen(pending.id, { onDismiss: returnToAuthoring })
    }
  }, [returnToAuthoring, sequenceModel, state.phase])

  const handleChangeSetup = React.useCallback(() => {
    handleSetupSummaryEdit({ type: 'external', id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID })
  }, [handleSetupSummaryEdit])

  const handleAuthoringCreated = React.useCallback(
    async (npc: CampaignNpcDetail) => {
      await onCreated(npc)
      trustedClose()
    },
    [onCreated, trustedClose],
  )

  return (
    <FormShellFooterScope>
      <CreateModalShell
        open={open}
        onOpenChange={handleDismiss}
        headline={
          state.phase === 'setup' ? QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE : QUICK_NPC_CREATE_TITLE
        }
        description={
          state.phase === 'setup'
            ? QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION
            : `Create a new NPC as a member of ${organization.name}.`
        }
        contentMode={state.phase === 'setup' ? 'scroll' : 'managed'}
        footer={
          state.phase === 'setup' ? (
            <CreateSetupFooter
              model={sequenceModel}
              onCancel={requestCancel}
              onSetupComplete={() => handleContinueFromSetup(state.setupValues)}
            />
          ) : (
            <FormShellFooterSlot />
          )
        }
      >
        {state.phase === 'setup' ? (
          <QuickNpcCreateSetupPhase
            buildContext={buildContext}
            organization={organization}
            setupValues={state.setupValues}
            setupSets={setupSets}
            sequenceModel={sequenceModel}
            onSetupValueChange={handleSetupValueChange}
          />
        ) : (
          <QuickNpcAuthoringForm
            key={`${state.setupValues.speciesId}:${state.setupValues.classId}:${state.setupValues.level}`}
            campaignId={campaignId}
            buildContext={buildContext}
            organization={organization}
            setup={state.setupValues}
            initialValues={state.authoringValues}
            onCancel={requestCancel}
            onChangeSetup={handleChangeSetup}
            onSetupSummaryEdit={handleSetupSummaryEdit}
            onCreated={handleAuthoringCreated}
            onPendingChange={setAuthoringPending}
          />
        )}
      </CreateModalShell>
    </FormShellFooterScope>
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
