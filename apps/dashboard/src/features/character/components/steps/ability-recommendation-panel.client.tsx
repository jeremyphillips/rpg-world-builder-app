'use client'

import { useMemo } from 'react'

import { characterBuilderAbilityRecommendationMessages, formatFieldMessage } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import { buildAbilityRecommendationPanelModel } from '../../lib/steps/ability-recommendation-panel.lib'
import {
  abilityRecommendationCalloutActionClasses,
  abilityRecommendationCalloutBodyClasses,
  abilityRecommendationCalloutClasses,
  abilityRecommendationCalloutTitleClasses,
} from './ability-recommendation.variants'
import type { AbilityRecommendationPanelProps } from './ability-recommendation-panel.types'

export type { AbilityRecommendationPanelProps } from './ability-recommendation-panel.types'

export function AbilityRecommendationPanel({
  classInput,
  recommendation,
  currentScores,
  showSuggestedAssignment = false,
  onApplySuggestions,
}: AbilityRecommendationPanelProps) {
  const model = useMemo(() => {
    if (!classInput) return null
    return buildAbilityRecommendationPanelModel({
      classInput,
      recommendation,
      currentScores,
      showSuggestedAssignment,
      canApplySuggestions: Boolean(onApplySuggestions),
    })
  }, [classInput, currentScores, onApplySuggestions, recommendation, showSuggestedAssignment])

  if (!classInput || !model) {
    return (
      <div className={abilityRecommendationCalloutClasses}>
        <Text variant="muted" className="text-sm">
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.noClass())}
        </Text>
      </div>
    )
  }

  return (
    <div className={abilityRecommendationCalloutClasses}>
      <p className={abilityRecommendationCalloutTitleClasses}>{model.heading}</p>
      <p className={abilityRecommendationCalloutBodyClasses}>
        {model.benefitText}
        {model.suggestedText ? <> {model.suggestedText}</> : null}
        {model.showAction && model.suggestedAssignment && onApplySuggestions ? (
          <>
            {' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className={abilityRecommendationCalloutActionClasses}
              onClick={() => onApplySuggestions(model.suggestedAssignment!)}
            >
              {model.actionLabel}
            </Button>
          </>
        ) : null}
        {model.showAppliedState ? (
          <>
            {' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className={abilityRecommendationCalloutActionClasses}
              disabled
              aria-disabled="true"
            >
              {model.appliedLabel}
            </Button>
          </>
        ) : null}
      </p>
    </div>
  )
}
