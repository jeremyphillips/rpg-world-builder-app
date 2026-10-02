import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { toast, usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import {
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
import type { QuickNpcEquipmentSeedContext } from '../../lib/quick-npc/quick-npc-equipment-selections.lib'
import {
  resolveQuickNpcCreateOrganization,
  resolveQuickNpcCreateRemountKey,
  type QuickNpcCreateContext,
} from '../../lib/quick-npc/quick-npc-create-context'
import { readQuickNpcClassPackage } from '../../lib/quick-npc/quick-npc-package-customization.lib'
import { resolveQuickNpcSetupChangeAuthoringState } from '../../lib/quick-npc/quick-npc-setup-change.lib'
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
import { QuickNpcEditingLockProvider } from './quick-npc-editing-lock'
import { QuickNpcCreateSetupPhase } from './quick-npc-create-setup-phase'
import { QuickNpcCreateModalSetupFooter } from './quick-npc-create-modal-setup-footer'

export type { QuickNpcCreateFormOrganization, QuickNpcCreateContext }

export { QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE } from './quick-npc-starting-choices.variants'

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
  equipmentBaseline?: QuickNpcEquipmentSeedContext
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
      setState((current) => {
        if (!current.authoringValues) {
          return {
            ...current,
            phase: 'authoring',
            setupValues: values,
            authoringValues: {
              equipmentSelections: [],
              requiredSpellIds: [],
              startingChoiceOverrides: {},
            },
          }
        }

        const reconciled = resolveQuickNpcSetupChangeAuthoringState({
          classPackage: readQuickNpcClassPackage(current.authoringValues.classPackage),
          overrides: current.authoringValues.startingChoiceOverrides ?? {},
          equipmentSelections: current.authoringValues.equipmentSelections ?? [],
          previous: current.equipmentBaseline ?? { level: values.level },
          next: {
            templateId: values.npcTemplateId,
            classId: values.classId,
            level: values.level,
            rulesetId: buildContext.rulesetId,
          },
          context: buildContext,
        })

        return {
          ...current,
          phase: 'authoring',
          setupValues: values,
          authoringValues: {
            ...current.authoringValues,
            equipmentSelections: reconciled.equipmentSelections,
            startingChoiceOverrides: reconciled.startingChoiceOverrides,
            classPackage: reconciled.classPackage,
            requiredSpellIds: [],
          },
          equipmentBaseline: {
            templateId: values.npcTemplateId,
            classId: values.classId,
            level: values.level,
          },
        }
      })
    },
    [buildContext, onSetupHandoff, setupCompletion, trustedClose],
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

  const handleSetupSummaryEdit = React.useCallback(
    (target: SetupSummaryEditTarget, authoringValues: Partial<QuickNpcAuthoringTabFormValues>) => {
      pendingSetupSummaryEditRef.current = target
      setState((current) => ({
        ...current,
        phase: 'setup',
        authoringValues: {
          ...current.authoringValues,
          ...authoringValues,
        },
        equipmentBaseline: {
          templateId: current.setupValues.npcTemplateId,
          classId: current.setupValues.classId,
          level: current.setupValues.level,
        },
      }))
    },
    [],
  )

  React.useLayoutEffect(() => {
    if (state.phase !== 'setup') return

    const pending = pendingSetupSummaryEditRef.current
    if (!pending) return

    pendingSetupSummaryEditRef.current = null
    if (pending.type === 'set') {
      sequenceModel.reopen(pending.id, { onDismiss: returnToAuthoring })
    }
  }, [returnToAuthoring, sequenceModel, state.phase])

  const handleChangeSetup = React.useCallback(
    (authoringValues?: Partial<QuickNpcAuthoringTabFormValues>) => {
      handleSetupSummaryEdit(
        { type: 'external', id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID },
        authoringValues ?? {},
      )
    },
    [handleSetupSummaryEdit],
  )

  const modalChrome = resolveQuickNpcModalChrome(context, state.phase)

  const setupFooterContext = React.useMemo(
    () => ({
      setupSets,
      externalDecisions,
      activeSetId: sequenceModel.activeSetId,
      isEditingUpstream: sequenceModel.isEditingUpstream,
    }),
    [externalDecisions, sequenceModel.activeSetId, sequenceModel.isEditingUpstream, setupSets],
  )

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
            <QuickNpcCreateModalSetupFooter
              buildContext={buildContext}
              createContext={context}
              setup={state.setupValues}
              authoringValues={state.authoringValues}
              previewNpcButtonRef={previewNpcButtonRef}
              sequenceModel={sequenceModel}
              footerContext={setupFooterContext}
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
          <QuickNpcEditingLockProvider>
            <QuickNpcAuthoringForm
              key={`${state.setupValues.npcTemplateId ?? ''}:${state.setupValues.speciesId}:${state.setupValues.classId}:${state.setupValues.level}`}
              campaignId={campaignId}
              buildContext={buildContext}
              createContext={context}
              setup={state.setupValues}
              initialValues={state.authoringValues}
              equipmentBaseline={state.equipmentBaseline}
              onCancel={requestCancel}
              onChangeSetup={handleChangeSetup}
              onSetupSummaryEdit={handleSetupSummaryEdit}
              onCreated={handleAuthoringCreated}
              onPendingChange={setAuthoringPending}
              previewButtonRef={previewNpcButtonRef}
            />
          </QuickNpcEditingLockProvider>
        )}
      </CreateModalShell>
    </FormShellFooterScope>
  )
}

/**
 * Quick NPC creation modal — setup then TabbedForm authoring. Cancel/X during
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
