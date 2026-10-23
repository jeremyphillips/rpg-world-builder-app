import { useCallback, useId, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  ABILITY_IDS,
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  getAbilityGenerationMethodDisplayName,
  type Ability,
  type AbilityScoreRecommendation,
  type AbilityScoreRecommendationClassInput,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  AbilityScoreNumeric,
  AbilityScoreRecommendationIndicator,
  type AbilityScoreCardState,
} from '@/components/ability-score'

import type { AbilitiesFormValues } from '../../../../../lib/steps/abilities-form-fields'
import { buildAbilityPreferenceLabelsByAbility } from '../../../../../lib/steps/ability-preference-indicator.lib'
import {
  ABILITY_SCORE_ASSIGNMENT_GRID_CLASSES,
  scoresFromFormValues,
} from '../../../../../lib/steps/fixed-scores-assignment.lib'
import { AbilityRecommendationPanel } from '../recommendation/ability-recommendation-panel'
export type ManualAbilitiesAssignmentProps = {
  showInvalidStates?: boolean
  classInput?: AbilityScoreRecommendationClassInput | null
  classStepApplicable?: boolean
  recommendation?: AbilityScoreRecommendation | null
}

function resolveManualCardState(
  assignedScore: number | undefined,
  showInvalidStates: boolean,
): AbilityScoreCardState {
  if (showInvalidStates && typeof assignedScore !== 'number') return 'invalid'
  return 'resting'
}

/** Manual per-ability score entry with class-based recommendation stars. */
export function ManualAbilitiesAssignment({
  showInvalidStates = false,
  classInput = null,
  classStepApplicable = false,
  recommendation = null,
}: ManualAbilitiesAssignmentProps) {
  const introId = useId()
  const form = useFormContext<AbilitiesFormValues>()
  const watchedValues = useWatch<AbilitiesFormValues>()

  const scores = useMemo(() => scoresFromFormValues(watchedValues ?? {}), [watchedValues])
  const preferenceLabels = useMemo(
    () => buildAbilityPreferenceLabelsByAbility(recommendation?.preferences ?? []),
    [recommendation?.preferences],
  )
  const methodHeading = getAbilityGenerationMethodDisplayName('manual')

  const handleCommit = useCallback(
    (ability: Ability, value: number | null) => {
      form.setValue(ability, value ?? undefined, { shouldDirty: true, shouldValidate: true })
    },
    [form],
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Text as="h3" id={introId} variant="label">
          {methodHeading}
        </Text>
      </div>

      <div className={ABILITY_SCORE_ASSIGNMENT_GRID_CLASSES} role="group" aria-labelledby={introId}>
        {ABILITY_IDS.map((ability) => {
          const assignedScore = scores[ability]
          const preferenceLabel = preferenceLabels[ability]
          const headerAdornment = preferenceLabel ? (
            <AbilityScoreRecommendationIndicator label={preferenceLabel} />
          ) : undefined

          return (
            <AbilityScoreNumeric
              key={ability}
              ability={ability}
              value={typeof assignedScore === 'number' ? assignedScore : null}
              min={ABILITY_SCORE_MIN}
              max={CHARACTER_ABILITY_SCORE_MAX}
              clearable
              size="md"
              state={resolveManualCardState(assignedScore, showInvalidStates)}
              headerAdornment={headerAdornment}
              onCommit={(value) => handleCommit(ability, value)}
            />
          )
        })}
      </div>

      <AbilityRecommendationPanel
        classInput={classInput}
        classStepApplicable={classStepApplicable}
        recommendation={recommendation}
        currentScores={scores}
      />
    </div>
  )
}
