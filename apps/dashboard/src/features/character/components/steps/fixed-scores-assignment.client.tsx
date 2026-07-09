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
  getAbilityGenerationMethodAssignmentDescription,
  getAbilityGenerationMethodDisplayName,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  fixedScoresScorePoolContainerClasses,
  fixedScoresScorePoolContainerDragOverClasses,
  fixedScoresScorePoolContainerProgressClasses,
  fixedScoresScorePoolContainerTokensClasses,
  fixedScoresTokenPoolSectionClasses,
} from './fixed-scores-assignment.variants'

export type FixedScoresAssignmentProps = {
  scorePool: readonly number[]
  showInvalidStates?: boolean
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="link"
          size="sm"
          className={abilityScoreCardChooseScoreClasses}
          aria-label={`${abilitiesFormCopy.chooseScore} for ${entry.label}`}
        >
          {abilitiesFormCopy.chooseScore}
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
  onSelectScore,
}: {
  ability: Ability
  scores: Partial<Record<Ability, number>>
  scorePool: readonly number[]
  showInvalidStates: boolean
  activeDrag: ActiveDragState
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
  )
}

function ScorePoolSection({
  poolId,
  availableScores,
  remainingCount,
  activeDrag,
}: {
  poolId: string
  availableScores: readonly number[]
  remainingCount: number
  activeDrag: ActiveDragState
}) {
  const isAssignedDrag = activeDrag?.kind === FIXED_SCORES_DND_KINDS.assigned

  const { setNodeRef, isOver } = useDroppable({
    id: fixedScoresPoolContainerDndId(),
    data: { kind: FIXED_SCORES_DND_KINDS.poolContainer },
  })

  return (
    <section aria-labelledby={poolId} className={fixedScoresTokenPoolSectionClasses}>
      <Text as="h4" id={poolId} variant="body" className="text-sm font-medium">
        {abilitiesFormCopy.availableScores}
      </Text>
      <div
        ref={setNodeRef}
        className={cn(
          fixedScoresScorePoolContainerClasses,
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
        <p className={fixedScoresScorePoolContainerProgressClasses} aria-live="polite">
          {abilitiesFormCopy.scoresRemaining(remainingCount)}
        </p>
      </div>
    </section>
  )
}

/** Fixed-score pool and per-ability card assignment with drag/drop and choose-score fallback. */
export function FixedScoresAssignment({
  scorePool,
  showInvalidStates = false,
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
    </div>
  )
}
