'use client'

import { useCallback, useId, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
  abilityModifier,
  characterBuilderAbilityRecommendationMessages,
  fillEmptyAbilitiesWithClassRecommendations,
  formatFieldMessage,
  getAbilityGenerationMethodAssignmentDescription,
  getAbilityGenerationMethodDisplayName,
  getAvailableStandardArrayScores,
  mergeSuggestedAssignmentIntoScores,
  resolveAbilityScorePoolActionState,
  type Ability,
  type AbilityScoreRecommendation,
  type AbilityScoreRecommendationClassInput,
} from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InsetPanel,
  Text,
  cn,
} from '@rpg/ui'

import {
  abilitiesFormCopy,
  FIXED_SCORES_EMPTY_SCORE_VALUE,
} from '../../lib/steps/abilities-form-labels'
import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'
import {
  assignScoreFromPool,
  clearAbilityScore,
  getFixedScoresRemainingCount,
  getScoreOptionsForAbility,
  replaceScoreFromPool,
  scoresFromFormValues,
} from '../../lib/steps/fixed-scores-assignment.lib'
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
} from '../../lib/steps/fixed-scores-dnd.lib'
import { formatPreviewSignedNumber } from '../../lib/character-builder-preview-panel.lib'
import { AbilityRecommendationPanel } from './ability-recommendation-panel.client'
import { AbilityScoreCardBadge } from './ability-score-card-badge.client'
import { AutoFillRemainingAction } from './auto-fill-remaining-action.client'
import { abilityScoreCardColumnClasses } from './ability-recommendation.variants'
import { ScoreToken } from './score-token.client'
import {
  abilityScoreCardAbbrClasses,
  abilityScoreCardChooseScoreClasses,
  abilityScoreCardChooseScoreSectionClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardNameClasses,
  abilityScoreCardScoreAreaClasses,
  abilityScoreCardScorePlaceholderOverlayClasses,
  abilityScoreCardScoreSlotClasses,
  abilityScoreCardClasses,
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
  recommendation?: AbilityScoreRecommendation | null
}

type AbilityCardState =
  | 'empty'
  | 'dragOverValid'
  | 'filled'
  | 'draggingFrom'
  | 'invalidAfterAttempt'

type ActiveDragState =
  | { kind: typeof FIXED_SCORES_DND_KINDS.pool; score: number }
  | { kind: typeof FIXED_SCORES_DND_KINDS.assigned; ability: Ability; score: number }
  | null

function resolveAbilityCardState({
  assignedScore,
  showInvalidStates,
  isDragOver,
  isDraggingFrom,
}: {
  assignedScore: number | undefined
  showInvalidStates: boolean
  isDragOver: boolean
  isDraggingFrom: boolean
}): AbilityCardState {
  if (isDraggingFrom) return 'draggingFrom'
  if (isDragOver) return 'dragOverValid'
  if (showInvalidStates && typeof assignedScore !== 'number') return 'invalidAfterAttempt'
  if (typeof assignedScore === 'number') return 'filled'
  return 'empty'
}

function ChooseScoreMenu({
  ability,
  scores,
  scorePool,
  onSelectScore,
}: {
  ability: Ability
  scores: Partial<Record<Ability, number>>
  scorePool: readonly number[]
  onSelectScore: (ability: Ability, value: string) => void
}) {
  const entry = ABILITY_ENTRIES[ability]
  const options = getScoreOptionsForAbility(ability, scores, scorePool)
  const assignedScore = scores[ability]
  const actionLabel =
    typeof assignedScore === 'number'
      ? abilitiesFormCopy.changeScore
      : abilitiesFormCopy.chooseScore

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="link"
          size="sm"
          className={abilityScoreCardChooseScoreClasses}
          aria-label={`${actionLabel} for ${entry.label}`}
        >
          {actionLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value || 'empty'}
            disabled={option.disabled}
            onSelect={() => onSelectScore(ability, option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AbilityScoreCard({
  ability,
  scores,
  scorePool,
  showInvalidStates,
  activeDrag,
  recommendation,
  onSelectScore,
}: {
  ability: Ability
  scores: Partial<Record<Ability, number>>
  scorePool: readonly number[]
  showInvalidStates: boolean
  activeDrag: ActiveDragState
  recommendation: AbilityScoreRecommendation | null
  onSelectScore: (ability: Ability, value: string) => void
}) {
  const entry = ABILITY_ENTRIES[ability]
  const assignedScore = scores[ability]
  const isDraggingFrom =
    activeDrag?.kind === FIXED_SCORES_DND_KINDS.assigned && activeDrag.ability === ability

  const { setNodeRef, isOver } = useDroppable({
    id: fixedScoresAbilityDropDndId(ability),
    data: { kind: FIXED_SCORES_DND_KINDS.abilityDrop, ability },
  })

  const cardState = resolveAbilityCardState({
    assignedScore,
    showInvalidStates,
    isDragOver: isOver && activeDrag !== null,
    isDraggingFrom,
  })

  const modifierLabel =
    typeof assignedScore === 'number'
      ? formatPreviewSignedNumber(abilityModifier(assignedScore))
      : abilitiesFormCopy.emptyModifier

  return (
    <div className={abilityScoreCardColumnClasses}>
      <AbilityScoreCardBadge ability={ability} recommendation={recommendation} />

      <article
        ref={setNodeRef}
        className={abilityScoreCardClasses(cardState)}
        aria-label={entry.label}
      >
        <header className={abilityScoreCardHeaderClasses}>
          <div className={abilityScoreCardAbbrClasses}>{ability.toUpperCase()}</div>
          <div className={abilityScoreCardNameClasses}>{entry.label}</div>
        </header>

        <div className={abilityScoreCardScoreAreaClasses}>
          <div className={abilityScoreCardScoreSlotClasses}>
            {typeof assignedScore === 'number' ? (
              <ScoreToken
                value={assignedScore}
                size="assigned"
                surface="plain"
                interactive
                sourceHidden={isDraggingFrom}
                ariaLabel={`${entry.label} score ${assignedScore}`}
                dndId={fixedScoresAssignedDndId(ability)}
                dndData={
                  {
                    kind: FIXED_SCORES_DND_KINDS.assigned,
                    ability,
                    score: assignedScore,
                  } satisfies FixedScoresAssignedDragData
                }
              />
            ) : null}
            {typeof assignedScore !== 'number' || isDraggingFrom ? (
              <ScoreToken
                label={abilitiesFormCopy.dropScoreHere}
                size="assigned"
                surface="placeholder"
                interactive={false}
                className={
                  isDraggingFrom ? abilityScoreCardScorePlaceholderOverlayClasses : undefined
                }
              />
            ) : null}
          </div>
          <span className={abilityScoreCardModifierClasses} aria-live="polite">
            <span className="sr-only">Modifier </span>
            {modifierLabel}
          </span>
        </div>

        <div className={abilityScoreCardChooseScoreSectionClasses}>
          <ChooseScoreMenu
            ability={ability}
            scores={scores}
            scorePool={scorePool}
            onSelectScore={onSelectScore}
          />
        </div>
      </article>
    </div>
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
        <Text as="h4" id={poolId} variant="body" className="text-sm font-medium">
          {abilitiesFormCopy.availableScores}
        </Text>
        {showPoolAction ? (
          <AutoFillRemainingAction label={poolActionLabel} onAutoFill={onPoolAction} />
        ) : null}
      </div>
      <InsetPanel
        ref={setNodeRef}
        borderStyle="dashed"
        surface="subtle"
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
  recommendation = null,
}: FixedScoresAssignmentProps) {
  const introId = useId()
  const poolId = useId()
  const form = useFormContext<AbilitiesFormValues>()
  const watchedValues = useWatch<AbilitiesFormValues>()
  const [activeDrag, setActiveDrag] = useState<ActiveDragState>(null)

  const scores = useMemo(() => scoresFromFormValues(watchedValues ?? {}), [watchedValues])
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
      const nextScores = resolveFixedScoresDragEnd(event, scores)
      if (!nextScores) return
      syncScoresToForm(nextScores)
    },
    [scores, syncScoresToForm],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
  }, [])

  const handleSelectScore = useCallback(
    (ability: Ability, value: string) => {
      let nextScores = scores

      if (value === FIXED_SCORES_EMPTY_SCORE_VALUE || value.trim() === '') {
        nextScores = clearAbilityScore(scores, ability)
      } else {
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) return

        nextScores =
          typeof scores[ability] === 'number'
            ? replaceScoreFromPool(scores, ability, parsed)
            : assignScoreFromPool(scores, ability, parsed)
      }

      syncScoresToForm(nextScores)
    },
    [scores, syncScoresToForm],
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
      fillEmptyAbilitiesWithClassRecommendations(scores, scorePool, classInput.primaryAbilities),
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
        <Text as="h3" id={introId} variant="body" className="text-sm font-medium">
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
              <AbilityScoreCard
                key={ability}
                ability={ability}
                scores={scores}
                scorePool={scorePool}
                showInvalidStates={showInvalidStates}
                activeDrag={activeDrag}
                recommendation={recommendation}
                onSelectScore={handleSelectScore}
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
        recommendation={recommendation}
        currentScores={scores}
        showSuggestedAssignment
        onApplySuggestions={handleApplySuggestions}
      />
    </div>
  )
}
