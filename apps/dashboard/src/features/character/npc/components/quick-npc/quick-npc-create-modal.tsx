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
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import {
  resolveQuickNpcCreateOrganization,
  resolveQuickNpcCreateRemountKey,
  type QuickNpcCreateContext,
} from '../../lib/quick-npc/quick-npc-create-context'
import { applyQuickNpcSetupValueChange } from '../../lib/quick-npc/quick-npc-setup-value-change.lib'
import {
  buildQuickNpcCreateSetupSets,
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
  resolveQuickNpcBuildExternalDecision,
  resolveQuickNpcModalChrome,
} from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import {
  QuickNpcAuthoringForm,
  type QuickNpcCreateFormOrganization,
} from './quick-npc-authoring-form'
import { QuickNpcCreateSetupPhase } from './quick-npc-create-setup-phase'
import { QuickNpcPreviewNpcButton } from './quick-npc-preview-npc-button'
import { quickNpcCreateFooterLayoutClasses } from './quick-npc-create-footer.variants'

export type { QuickNpcCreateFormOrganization, QuickNpcCreateContext }

export { QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE } from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'

export type QuickNpcCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  buildContext: CharacterBuildContext
  context: QuickNpcCreateContext
  /** Called when the user dismisses authoring — parent should restore the add drawer. */
  onCancel: () => void
  onCreated?: OnContentCreated
  setupCompletion?: 'authoring' | 'handoff'
  onSetupHandoff?: (setup: QuickNpcSetupValues) => void
}

type QuickNpcCreateModalPhase = 'setup' | 'authoring'

type QuickNpcCreateModalState = {
  phase: QuickNpcCreateModalPhase
  setupValues: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabFormValues>
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

function QuickNpcCreateModalSession({
  open,
  onOpenChange,
  campaignId,
  buildContext,
  context,
  onCancel,
  onCreated,
  setupCompletion = 'authoring',
  onSetupHandoff,
}: QuickNpcCreateModalProps) {
  const [state, setState] = React.useState(() => createInitialState(buildContext, context))
  const [authoringPending, setAuthoringPending] = React.useState(false)
  const pendingSetupSummaryEditRef = React.useRef<SetupSummaryEditTarget | null>(null)
  const previewNpcButtonRef = React.useRef<HTMLButtonElement>(null)
  const setupValuesRef = React.useRef(state.setupValues)
  React.useEffect(() => {
    setupValuesRef.current = state.setupValues
  }, [state.setupValues])
  const { trustedClose } = usePendingAwareOpenChange({
    pending: authoringPending,
    onOpenChange,
  })

  const organization = resolveQuickNpcCreateOrganization(context)
  const organizationMembers = organization?.members
  const titles = organizationMembers?.titles ?? []
  const classAffinityIds = organizationMembers?.classAffinityIds
  const speciesAffinityIds = organizationMembers?.speciesAffinityIds
  const organizationTemplateId = organizationMembers?.npcTemplateId

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

  const handleContinueFromSetup = React.useCallback(
    (values: QuickNpcSetupValues) => {
      if (setupCompletion === 'handoff') {
        onSetupHandoff?.(values)
        trustedClose()
        return
      }
      setState((current) => ({
        ...current,
        phase: 'authoring',
        setupValues: values,
        authoringValues: {
          additionalEquipmentIds: [],
          requiredSpellIds: [],
          startingChoiceOverrides: {},
        },
      }))
    },
    [onSetupHandoff, setupCompletion, trustedClose],
  )

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
        organizationTemplateId,
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
    [
      buildContext,
      classAffinityIds,
      context,
      handleContinueFromSetup,
      organizationTemplateId,
      speciesAffinityIds,
      titles,
    ],
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
        additionalEquipmentIds: [],
        requiredSpellIds: [],
        startingChoiceOverrides: {},
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

  const modalChrome = resolveQuickNpcModalChrome(context, state.phase)

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
        headline={modalChrome.headline}
        description={modalChrome.description}
        contentMode={state.phase === 'setup' ? 'scroll' : 'managed'}
        footer={
          state.phase === 'setup' ? (
            <div className={quickNpcCreateFooterLayoutClasses()}>
              <QuickNpcPreviewNpcButton
                buttonRef={previewNpcButtonRef}
                buildContext={buildContext}
                createContext={context}
                setup={state.setupValues}
                authoringValues={state.authoringValues}
              />
              <CreateSetupFooter
                model={sequenceModel}
                onCancel={requestCancel}
                onSetupComplete={() => handleContinueFromSetup(state.setupValues)}
              />
            </div>
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
            key={`${state.setupValues.npcTemplateId ?? ''}:${state.setupValues.speciesId}:${state.setupValues.classId}:${state.setupValues.level}`}
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
            previewButtonRef={previewNpcButtonRef}
          />
        )}
      </CreateModalShell>
    </FormShellFooterScope>
  )
}

/**
 * Quick NPC creation modal — setup then TabbedForm authoring. Cancel/X/Escape during
 * authoring returns to the parent create surface; success closes nested overlays.
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
