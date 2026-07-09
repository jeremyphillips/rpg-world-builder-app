'use client'

import { useCallback, useId, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  abilityModifier,
  getAbilityGenerationMethodDisplayName,
  type Ability,
  type AbilityScoreRecommendation,
  type AbilityScoreRecommendationClassInput,
} from '@rpg/contracts'
import { NumberInput, Text } from '@rpg/ui'

import { abilitiesFormCopy } from '../../lib/steps/abilities-form-labels'
import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'
import { scoresFromFormValues } from '../../lib/steps/fixed-scores-assignment.lib'
import { formatPreviewSignedNumber } from '../../lib/character-builder-preview-panel.lib'
import { AbilityRecommendationPanel } from './ability-recommendation-panel.client'
import { AbilityScoreCardBadge } from './ability-score-card-badge.client'
import { abilityScoreCardColumnClasses } from './ability-recommendation.variants'
import {
  abilityScoreCardAbbrClasses,
  abilityScoreCardClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardNameClasses,
  abilityScoreCardScoreAreaClasses,
  abilityScoreCardScoreSlotClasses,
  fixedScoresAbilityGridClasses,
  fixedScoresAssignmentIntroClasses,
  fixedScoresAssignmentRootClasses,
} from './fixed-scores-assignment.variants'

export type ManualAbilitiesAssignmentProps = {
  showInvalidStates?: boolean
  classInput?: AbilityScoreRecommendationClassInput | null
  recommendation?: AbilityScoreRecommendation | null
}

function ManualAbilityScoreCard({
  ability,
  assignedScore,
  showInvalidStates,
  recommendation,
  onScoreChange,
}: {
  ability: Ability
  assignedScore: number | undefined
  showInvalidStates: boolean
  recommendation: AbilityScoreRecommendation | null
  onScoreChange: (ability: Ability, value: number | undefined) => void
}) {
  const entry = ABILITY_ENTRIES[ability]
  const cardState =
    showInvalidStates && typeof assignedScore !== 'number'
      ? 'invalidAfterAttempt'
      : typeof assignedScore === 'number'
        ? 'filled'
        : 'empty'

  const modifierLabel =
    typeof assignedScore === 'number'
      ? formatPreviewSignedNumber(abilityModifier(assignedScore))
      : abilitiesFormCopy.emptyModifier

  return (
    <div className={abilityScoreCardColumnClasses}>
      <AbilityScoreCardBadge ability={ability} recommendation={recommendation} />

      <article className={abilityScoreCardClasses(cardState)} aria-label={entry.label}>
        <header className={abilityScoreCardHeaderClasses}>
          <div className={abilityScoreCardAbbrClasses}>{ability.toUpperCase()}</div>
          <div className={abilityScoreCardNameClasses}>{entry.label}</div>
        </header>

        <div className={abilityScoreCardScoreAreaClasses}>
          <div className={abilityScoreCardScoreSlotClasses}>
            <NumberInput
              aria-label={`${entry.label} score`}
              size="sm"
              digits={2}
              min={ABILITY_SCORE_MIN}
              max={CHARACTER_ABILITY_SCORE_MAX}
              value={typeof assignedScore === 'number' ? assignedScore : ''}
              onChange={(event) => {
                const raw = event.target.value.trim()
                if (raw === '') {
                  onScoreChange(ability, undefined)
                  return
                }
                const parsed = Number(raw)
                if (!Number.isFinite(parsed)) return
                onScoreChange(ability, parsed)
              }}
            />
          </div>
          <span className={abilityScoreCardModifierClasses} aria-live="polite">
            <span className="sr-only">Modifier </span>
            {modifierLabel}
          </span>
        </div>
      </article>
    </div>
  )
}

/** Manual per-ability score entry with class-based recommendation badges. */
export function ManualAbilitiesAssignment({
  showInvalidStates = false,
  classInput = null,
  recommendation = null,
}: ManualAbilitiesAssignmentProps) {
  const introId = useId()
  const form = useFormContext<AbilitiesFormValues>()
  const watchedValues = useWatch<AbilitiesFormValues>()

  const scores = useMemo(() => scoresFromFormValues(watchedValues ?? {}), [watchedValues])
  const methodHeading = getAbilityGenerationMethodDisplayName('manual')

  const handleScoreChange = useCallback(
    (ability: Ability, value: number | undefined) => {
      form.setValue(ability, value, { shouldDirty: true, shouldValidate: true })
    },
    [form],
  )

  return (
    <div className={fixedScoresAssignmentRootClasses}>
      <div className={fixedScoresAssignmentIntroClasses}>
        <Text as="h3" id={introId} variant="body" className="text-sm font-medium">
          {methodHeading}
        </Text>
      </div>

      <div className={fixedScoresAbilityGridClasses} role="group" aria-labelledby={introId}>
        {ABILITY_IDS.map((ability) => (
          <ManualAbilityScoreCard
            key={ability}
            ability={ability}
            assignedScore={scores[ability]}
            showInvalidStates={showInvalidStates}
            recommendation={recommendation}
            onScoreChange={handleScoreChange}
          />
        ))}
      </div>

      <AbilityRecommendationPanel
        classInput={classInput}
        recommendation={recommendation}
        currentScores={scores}
      />
    </div>
  )
}
