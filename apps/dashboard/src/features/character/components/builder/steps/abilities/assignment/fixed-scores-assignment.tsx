import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
} from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  characterBuilderAbilityRecommendationMessages,
  fillEmptyAbilitiesWithClassRecommendations,
  formatFieldMessage,
  getAbilityGenerationMethodAssignmentDescription,
  getAbilityGenerationMethodDisplayName,
  getAvailableStandardArrayScores,
  mergeSuggestedAssignmentIntoScores,
  resolveAbilityScorePoolActionState,
  resolveClassAbilityScoreOrder,
  type Ability,
  type AbilityScoreRecommendation,
  type AbilityScoreRecommendationClassInput,
} from '@rpg/contracts'
import { InsetPanel, Text, cn } from '@rpg/ui'

import {
  AbilityScoreRecommendationIndicator,
  AbilityScoreSelect,
  type AbilityScoreCardState,
} from '@/components/ability-score'

import { abilitiesFormCopy } from '../../../../../lib/steps/abilities-form-labels'
import type { AbilitiesFormValues } from '../../../../../lib/steps/abilities-form-fields'
import { buildAbilityPreferenceLabelsByAbility } from '../../../../../lib/steps/ability-preference-indicator.lib'
import {
  buildFixedScoreSelectOptions,
  getFixedScoresRemainingCount,
  resolveStandardArrayScoreToAbility,
  scoresFromFormValues,
} from '../../../../../lib/steps/fixed-scores-assignment.lib'
import {
  FIXED_SCORES_DND_KINDS,
  fixedScoresAbilityDropDndId,
  fixedScoresAssignedDndId,
  fixedScoresCollisionDetection,
  fixedScoresPoolContainerDndId,
  fixedScoresPoolDndId,
  resolveFixedScoresDragEnd,
  type FixedScoresAssignedDragData,
  type FixedScoresPoolDragData,
} from '../../../../../lib/steps/fixed-scores-dnd.lib'
import { AbilityRecommendationPanel } from '../recommendation/ability-recommendation-panel'
import { AutoFillRemainingAction } from './auto-fill-remaining-action'
import { ScoreToken } from './score-token'
import {
  fixedScoresAbilityGridClasses,
  fixedScoresAssignmentIntroClasses,
  fixedScoresAssignmentRootClasses,
  fixedScoresScorePoolContainerDragOverClasses,
  fixedScoresScorePoolContainerTokensClasses,
  fixedScoresScorePoolHeaderClasses,
  fixedScoresTokenPoolSectionClasses,
} from './fixed-scores-assignment.variants'

export type FixedScoresAssignmentProps = {
  scorePool: readonly number[]
  showInvalidStates?: boolean
  classInput?: AbilityScoreRecommendationClassInput | null
  classStepApplicable?: boolean
  recommendation?: AbilityScoreRecommendation | null
}

type ActiveDragState =
  | { kind: typeof FIXED_SCORES_DND_KINDS.pool; score: number }
  | { kind: typeof FIXED_SCORES_DND_KINDS.assigned; ability: Ability; score: number }
  | null

function resolveAbilityCardState({
  assignedScore,
  showInvalidStates,
  isDragOver,
  isDraggingFrom,
  activeDrag,
}: {
  assignedScore: number | undefined
  showInvalidStates: boolean
  isDragOver: boolean
  isDraggingFrom: boolean
  activeDrag: ActiveDragState
}): AbilityScoreCardState {
  if (isDraggingFrom) return 'draggingFrom'
  if (isDragOver && activeDrag !== null) return 'dragOver'
  if (showInvalidStates && typeof assignedScore !== 'number') return 'invalid'
  return 'resting'
}

function FixedScoresAbilityCard({
  ability,
  scores,
  scorePool,
  showInvalidStates,
  activeDrag,
  preferenceLabel,
  open,
  onOpenChange,
  onSelectScore,
  suppressScoreClickRef,
}: {
  ability: Ability
  scores: Partial<Record<Ability, number>>
  scorePool: readonly number[]
  showInvalidStates: boolean
  activeDrag: ActiveDragState
  preferenceLabel?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectScore: (ability: Ability, score: number) => void
  suppressScoreClickRef: MutableRefObject<boolean>
}) {
  const entry = ABILITY_ENTRIES[ability]
  const assignedScore = scores[ability]
  const isDraggingFrom =
    activeDrag?.kind === FIXED_SCORES_DND_KINDS.assigned && activeDrag.ability === ability

  const { setNodeRef, isOver } = useDroppable({
    id: fixedScoresAbilityDropDndId(ability),
    data: { kind: FIXED_SCORES_DND_KINDS.abilityDrop, ability },
  })

  const {
    attributes,
    listeners,
    setNodeRef: setDragHandleRef,
  } = useDraggable({
    id: fixedScoresAssignedDndId(ability),
    data: {
      kind: FIXED_SCORES_DND_KINDS.assigned,
      ability,
      score: assignedScore ?? 0,
    } satisfies FixedScoresAssignedDragData,
    disabled: typeof assignedScore !== 'number',
  })

  const cardState = resolveAbilityCardState({
    assignedScore,
    showInvalidStates,
    isDragOver: isOver,
    isDraggingFrom,
    activeDrag,
  })

  const scoreOptions = useMemo(
    () => buildFixedScoreSelectOptions(ability, scores, scorePool),
    [ability, scores, scorePool],
  )

  const headerAdornment = preferenceLabel ? (
    <AbilityScoreRecommendationIndicator label={preferenceLabel} />
  ) : undefined

  const scoreDragHandleProps =
    typeof assignedScore === 'number'
      ? {
          ref: setDragHandleRef,
          ...listeners,
          ...attributes,
          'aria-label': `${entry.label} score ${assignedScore}`,
          className: 'cursor-grab active:cursor-grabbing',
          onClick: (event: MouseEvent<HTMLElement>) => {
            if (suppressScoreClickRef.current) {
              suppressScoreClickRef.current = false
              event.preventDefault()
            }
          },
        }
      : undefined

  const pendingScore =
    cardState === 'dragOver' && activeDrag !== null ? activeDrag.score : undefined

  return (
    <AbilityScoreSelect
      ref={setNodeRef}
      ability={ability}
      value={typeof assignedScore === 'number' ? assignedScore : null}
      scoreOptions={scoreOptions}
      open={open}
      onOpenChange={onOpenChange}
      state={cardState}
      size="md"
      headerAdornment={headerAdornment}
      scoreDragHandleProps={scoreDragHandleProps}
      pendingScore={pendingScore}
      onSelect={(score) => onSelectScore(ability, score)}
    />
  )
}

function ScorePoolSection({
  poolId,
  availableScores,
  remainingCount,
  activeDrag,
  showPoolAction,
  poolActionLabel,
  onPoolAction,
}: {
  poolId: string
  availableScores: readonly number[]
  remainingCount: number
  activeDrag: ActiveDragState
  showPoolAction: boolean
  poolActionLabel: string
  onPoolAction: () => void
}) {
  const isAssignedDrag = activeDrag?.kind === FIXED_SCORES_DND_KINDS.assigned

  const { setNodeRef, isOver } = useDroppable({
    id: fixedScoresPoolContainerDndId(),
    data: { kind: FIXED_SCORES_DND_KINDS.poolContainer },
  })

  return (
    <section aria-labelledby={poolId} className={fixedScoresTokenPoolSectionClasses}>
      <div className={fixedScoresScorePoolHeaderClasses}>
        <Text as="h4" id={poolId} variant="body" className="text-style-label">
          {abilitiesFormCopy.availableScores}
        </Text>
        {showPoolAction ? (
          <AutoFillRemainingAction label={poolActionLabel} onAutoFill={onPoolAction} />
        ) : null}
      </div>
      <InsetPanel
        ref={setNodeRef}
        borderStyle="dashed"
        surface={{ emphasis: 'subtle' }}
        size="md"
        className={cn(
          'flex flex-col gap-2 transition-colors',
          isAssignedDrag && isOver && fixedScoresScorePoolContainerDragOverClasses,
        )}
      >
        <div className={fixedScoresScorePoolContainerTokensClasses}>
          {availableScores.map((score) => (
            <ScoreToken
              key={score}
              value={score}
              size="pool"
              surface="token"
              interactive
              dragging={
                activeDrag?.kind === FIXED_SCORES_DND_KINDS.pool && activeDrag.score === score
              }
              dndId={fixedScoresPoolDndId(score)}
              dndData={
                { kind: FIXED_SCORES_DND_KINDS.pool, score } satisfies FixedScoresPoolDragData
              }
            />
          ))}
        </div>
        <InsetPanel.Text as="p" variant="small" aria-live="polite">
          {abilitiesFormCopy.scoresRemaining(remainingCount)}
        </InsetPanel.Text>
      </InsetPanel>
    </section>
  )
}

/** Fixed-score pool and per-ability card assignment with drag/drop and choose-score fallback. */
export function FixedScoresAssignment({
  scorePool,
  showInvalidStates = false,
  classInput = null,
  classStepApplicable = false,
  recommendation = null,
}: FixedScoresAssignmentProps) {
  const introId = useId()
  const poolId = useId()
  const form = useFormContext<AbilitiesFormValues>()
  const watchedValues = useWatch<AbilitiesFormValues>()
  const [activeDrag, setActiveDrag] = useState<ActiveDragState>(null)
  const [openAbility, setOpenAbility] = useState<Ability | null>(null)
  const suppressScoreClickRef = useRef(false)

  const scores = useMemo(() => scoresFromFormValues(watchedValues ?? {}), [watchedValues])
  const preferenceLabels = useMemo(
    () => buildAbilityPreferenceLabelsByAbility(recommendation?.preferences ?? []),
    [recommendation?.preferences],
  )
  const availableScores = useMemo(
    () => getAvailableStandardArrayScores(scores, scorePool),
    [scores, scorePool],
  )
  const remainingCount = getFixedScoresRemainingCount(scores, scorePool)
  const poolActionState = resolveAbilityScorePoolActionState(scores, classInput != null)
  const showPoolAction = poolActionState !== 'hidden'
  const poolActionLabel = formatFieldMessage(
    poolActionState === 'clear'
      ? characterBuilderAbilityRecommendationMessages.clearScores()
      : characterBuilderAbilityRecommendationMessages.autoFillRemaining(),
  )

  const methodHeading = getAbilityGenerationMethodDisplayName('standard-array')
  const methodDescription = getAbilityGenerationMethodAssignmentDescription('standard-array')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const syncScoresToForm = useCallback(
    (nextScores: Partial<Record<Ability, number>>) => {
      for (const ability of ABILITY_IDS) {
        const score = nextScores[ability]
        form.setValue(ability, typeof score === 'number' ? score : undefined, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    },
    [form],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    suppressScoreClickRef.current = true
    setOpenAbility(null)
    const data = event.active.data.current as
      | FixedScoresPoolDragData
      | FixedScoresAssignedDragData
      | undefined
    if (!data) return

    if (data.kind === FIXED_SCORES_DND_KINDS.pool) {
      setActiveDrag({ kind: FIXED_SCORES_DND_KINDS.pool, score: data.score })
      return
    }

    if (data.kind === FIXED_SCORES_DND_KINDS.assigned) {
      setActiveDrag({
        kind: FIXED_SCORES_DND_KINDS.assigned,
        ability: data.ability,
        score: data.score,
      })
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)
      const nextScores = resolveFixedScoresDragEnd(event, scores, scorePool)
      if (!nextScores) return
      syncScoresToForm(nextScores)
    },
    [scorePool, scores, syncScoresToForm],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
  }, [])

  const handleSelectScore = useCallback(
    (ability: Ability, score: number) => {
      const resolved = resolveStandardArrayScoreToAbility(scores, scorePool, ability, score)
      if (
        resolved.operation !== 'assign' &&
        resolved.operation !== 'move' &&
        resolved.operation !== 'swap'
      ) {
        return
      }
      syncScoresToForm(resolved.next)
      setOpenAbility(null)
    },
    [scorePool, scores, syncScoresToForm],
  )

  const handleApplySuggestions = useCallback(
    (suggestedAssignment: Partial<Record<Ability, number>>) => {
      syncScoresToForm(mergeSuggestedAssignmentIntoScores(scores, suggestedAssignment))
    },
    [scores, syncScoresToForm],
  )

  const handlePoolAction = useCallback(() => {
    if (!classInput) return

    if (poolActionState === 'clear') {
      const emptyValues = ABILITY_IDS.reduce<AbilitiesFormValues>((values, ability) => {
        values[ability] = undefined
        return values
      }, {} as AbilitiesFormValues)
      form.reset(emptyValues, { keepDefaultValues: false })
      return
    }

    syncScoresToForm(
      fillEmptyAbilitiesWithClassRecommendations(
        scores,
        scorePool,
        resolveClassAbilityScoreOrder({
          abilityScoreOrder: classInput.abilityScoreOrder,
          primaryAbilities: classInput.primaryAbilities,
        }),
      ),
    )
  }, [classInput, form, poolActionState, scorePool, scores, syncScoresToForm])

  const overlayScore =
    activeDrag?.kind === FIXED_SCORES_DND_KINDS.pool
      ? activeDrag.score
      : activeDrag?.kind === FIXED_SCORES_DND_KINDS.assigned
        ? activeDrag.score
        : null

  return (
    <div className={fixedScoresAssignmentRootClasses}>
      <div className={fixedScoresAssignmentIntroClasses}>
        <Text as="h3" id={introId} variant="body" className="text-style-label">
          {methodHeading}
        </Text>
        {methodDescription ? (
          <Text variant="muted" className="text-sm">
            {methodDescription}
          </Text>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={fixedScoresCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-6">
          <ScorePoolSection
            poolId={poolId}
            availableScores={availableScores}
            remainingCount={remainingCount}
            activeDrag={activeDrag}
            showPoolAction={showPoolAction}
            poolActionLabel={poolActionLabel}
            onPoolAction={handlePoolAction}
          />

          <div className={fixedScoresAbilityGridClasses} role="group" aria-labelledby={introId}>
            {ABILITY_IDS.map((ability) => (
              <FixedScoresAbilityCard
                key={ability}
                ability={ability}
                scores={scores}
                scorePool={scorePool}
                showInvalidStates={showInvalidStates}
                activeDrag={activeDrag}
                preferenceLabel={preferenceLabels[ability]}
                open={openAbility === ability}
                onOpenChange={(nextOpen) => {
                  setOpenAbility(nextOpen ? ability : null)
                }}
                onSelectScore={handleSelectScore}
                suppressScoreClickRef={suppressScoreClickRef}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {overlayScore !== null && activeDrag ? (
            <ScoreToken
              value={overlayScore}
              size={activeDrag.kind === FIXED_SCORES_DND_KINDS.pool ? 'pool' : 'assigned'}
              surface="token"
              dragOverlay
              interactive={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AbilityRecommendationPanel
        classInput={classInput}
        classStepApplicable={classStepApplicable}
        recommendation={recommendation}
        currentScores={scores}
        showSuggestedAssignment
        onApplySuggestions={handleApplySuggestions}
      />
    </div>
  )
}
