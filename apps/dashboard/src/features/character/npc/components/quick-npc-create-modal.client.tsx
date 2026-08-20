'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { toast, usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import {
  CreateSetupFooter,
  notifyCreateSetupValueChangeCompletion,
  useCreateSetupSequence,
  type SetupSummaryEditTarget,
} from '@/lib/create-setup'
import { CreateModalShell, type OnContentCreated } from '@/lib/create-flow'
import { formatNestedCreateHandoffFailure, invokeOnContentCreated } from '@/lib/create-flow'

import {
  createQuickNpcSetupDefaultValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import {
  resolveQuickNpcCreateOrganization,
  resolveQuickNpcCreateRemountKey,
  type QuickNpcCreateContext,
} from '../lib/quick-npc-create-context'
import { applyQuickNpcSetupValueChange } from '../lib/quick-npc-setup-value-change.lib'
import {
  buildQuickNpcCreateSetupSets,
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
  QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  QUICK_NPC_STANDALONE_SETUP_DESCRIPTION,
  QUICK_NPC_STANDALONE_SETUP_HEADLINE,
  resolveQuickNpcBuildExternalDecision,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  QuickNpcAuthoringForm,
  type QuickNpcCreateFormOrganization,
} from './quick-npc-authoring-form.client'
import { QuickNpcCreateSetupPhase } from './quick-npc-create-setup-phase.client'

export type { QuickNpcCreateFormOrganization, QuickNpcCreateContext }

export const QUICK_NPC_CREATE_TITLE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE

export type QuickNpcCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  buildContext: CharacterBuildContext
  context: QuickNpcCreateContext
  /** Called when the user dismisses authoring — parent should restore the add drawer. */
  onCancel: () => void
  onCreated?: OnContentCreated
}

type QuickNpcCreateModalPhase = 'setup' | 'authoring'

type QuickNpcCreateModalState = {
  phase: QuickNpcCreateModalPhase
  setupValues: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabValues>
}

function createInitialState(
  buildContext: CharacterBuildContext,
  createContext: QuickNpcCreateContext,
): QuickNpcCreateModalState {
  return {
    phase: 'setup',
    setupValues: createQuickNpcSetupDefaultValues(buildContext, createContext),
  }
}

function resolveQuickNpcSetupHeadline(context: QuickNpcCreateContext): string {
  return context.kind === 'standalone'
    ? QUICK_NPC_STANDALONE_SETUP_HEADLINE
    : QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE
}

function resolveQuickNpcSetupDescription(context: QuickNpcCreateContext): string {
  return context.kind === 'standalone'
    ? QUICK_NPC_STANDALONE_SETUP_DESCRIPTION
    : QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION
}

function resolveQuickNpcAuthoringDescription(context: QuickNpcCreateContext): string {
  if (context.kind === 'standalone') {
    return 'Create a new NPC.'
  }
  return `Create a new NPC as a member of ${context.organization.name}.`
}

function QuickNpcCreateModalSession({
  open,
  onOpenChange,
  campaignId,
  buildContext,
  context,
  onCancel,
  onCreated,
}: QuickNpcCreateModalProps) {
  const [state, setState] = React.useState(() => createInitialState(buildContext, context))
  const [authoringPending, setAuthoringPending] = React.useState(false)
  const pendingSetupSummaryEditRef = React.useRef<SetupSummaryEditTarget | null>(null)
  const setupValuesRef = React.useRef(state.setupValues)
  setupValuesRef.current = state.setupValues
  const { trustedClose } = usePendingAwareOpenChange({
    pending: authoringPending,
    onOpenChange,
  })

  const organization = resolveQuickNpcCreateOrganization(context)
  const organizationMembers = organization?.members
  const titles = organizationMembers?.titles ?? []
  const classAffinityIds = organizationMembers?.classAffinityIds
  const speciesAffinityIds = organizationMembers?.speciesAffinityIds

  const setupSets = React.useMemo(
    () =>
      buildQuickNpcCreateSetupSets({
        createContext: context,
        context: buildContext,
        values: state.setupValues,
        titles,
        members: {
          classAffinityIds,
          speciesAffinityIds,
        },
      }),
    [buildContext, classAffinityIds, context, speciesAffinityIds, state.setupValues, titles],
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
        createContext: context,
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
        createContext: context,
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
    [buildContext, classAffinityIds, context, handleContinueFromSetup, speciesAffinityIds, titles],
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
    async (result: { contentType: 'npcs'; id: string }) => {
      try {
        await invokeOnContentCreated(onCreated, result)
      } catch (error) {
        toast.warning(formatNestedCreateHandoffFailure(error))
        return
      }

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
          state.phase === 'setup' ? resolveQuickNpcSetupHeadline(context) : QUICK_NPC_CREATE_TITLE
        }
        description={
          state.phase === 'setup'
            ? resolveQuickNpcSetupDescription(context)
            : resolveQuickNpcAuthoringDescription(context)
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
            createContext={context}
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
            createContext={context}
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
  return (
    <QuickNpcCreateModalSession
      key={resolveQuickNpcCreateRemountKey(props.context, props.campaignId)}
      {...props}
    />
  )
}
