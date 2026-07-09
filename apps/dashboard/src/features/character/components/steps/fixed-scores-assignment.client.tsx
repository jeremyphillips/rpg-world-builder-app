'use client'

import { useCallback, useId, useMemo, useState } from 'react'
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
import { CSS } from '@dnd-kit/utilities'
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
  fixedScoresPoolDndId,
  resolveFixedScoresDragEnd,
  type FixedScoresAssignedDragData,
  type FixedScoresPoolDragData,
} from '../../lib/steps/fixed-scores-dnd.lib'
import { formatPreviewSignedNumber } from '../../lib/character-builder-preview-panel.lib'
import {
  abilityScoreCardAbbrClasses,
  abilityScoreCardAssignedScoreClasses,
  abilityScoreCardAssignedScoreDraggingClasses,
  abilityScoreCardChooseScoreClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardNameClasses,
  abilityScoreCardPlaceholderClasses,
  abilityScoreCardScoreAreaClasses,
  abilityScoreCardClasses,
  fixedScoresAbilityGridClasses,
  fixedScoresAssignmentIntroClasses,
  fixedScoresAssignmentRootClasses,
  fixedScoresDragOverlayTokenClasses,
  fixedScoresRemainingClasses,
  fixedScoresScoreTokenClasses,
  fixedScoresScoreTokenDraggingClasses,
  fixedScoresTokenPoolClasses,
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

function ScoreToken({ score, isDragging }: { score: number; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: fixedScoresPoolDndId(score),
    data: { kind: FIXED_SCORES_DND_KINDS.pool, score } satisfies FixedScoresPoolDragData,
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className={cn(
        fixedScoresScoreTokenClasses,
        isDragging && fixedScoresScoreTokenDraggingClasses,
      )}
      aria-label={`Score ${score}`}
      {...listeners}
      {...attributes}
    >
      {score}
    </button>
  )
}

function AssignedScoreValue({
  ability,
  score,
  isDragging,
}: {
  ability: Ability
  score: number
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: fixedScoresAssignedDndId(ability),
    data: {
      kind: FIXED_SCORES_DND_KINDS.assigned,
      ability,
      score,
    } satisfies FixedScoresAssignedDragData,
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={cn(
        abilityScoreCardAssignedScoreClasses,
        isDragging && abilityScoreCardAssignedScoreDraggingClasses,
      )}
      aria-label={`${ABILITY_ENTRIES[ability].label} score ${score}`}
      {...listeners}
      {...attributes}
    >
      {score}
    </span>
  )
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
        {typeof assignedScore === 'number' && !isDraggingFrom ? (
          <AssignedScoreValue ability={ability} score={assignedScore} />
        ) : (
          <span className={abilityScoreCardPlaceholderClasses}>
            {abilitiesFormCopy.dropScoreHere}
          </span>
        )}
        <span className={abilityScoreCardModifierClasses} aria-live="polite">
          <span className="sr-only">Modifier </span>
          {modifierLabel}
        </span>
      </div>

      <ChooseScoreMenu
        ability={ability}
        scores={scores}
        scorePool={scorePool}
        onSelectScore={onSelectScore}
      />
    </article>
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

      <p className={fixedScoresRemainingClasses} aria-live="polite">
        {abilitiesFormCopy.scoresRemaining(remainingCount)}
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-6">
          {availableScores.length > 0 ? (
            <section aria-labelledby={poolId} className={fixedScoresTokenPoolSectionClasses}>
              <Text as="h4" id={poolId} variant="body" className="text-sm font-medium">
                {abilitiesFormCopy.availableScores}
              </Text>
              <div className={fixedScoresTokenPoolClasses}>
                {availableScores.map((score) => (
                  <ScoreToken
                    key={score}
                    score={score}
                    isDragging={
                      activeDrag?.kind === FIXED_SCORES_DND_KINDS.pool && activeDrag.score === score
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

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
          {overlayScore !== null ? (
            activeDrag?.kind === FIXED_SCORES_DND_KINDS.pool ? (
              <div className={fixedScoresDragOverlayTokenClasses} aria-hidden>
                {overlayScore}
              </div>
            ) : (
              <span className={abilityScoreCardAssignedScoreClasses} aria-hidden>
                {overlayScore}
              </span>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
