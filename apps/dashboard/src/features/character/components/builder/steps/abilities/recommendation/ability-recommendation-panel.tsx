import { useMemo } from 'react'

import { characterBuilderAbilityRecommendationMessages, formatFieldMessage } from '@rpg/contracts'
import { Button, Card, CardContent, Text } from '@rpg/ui'

import { buildAbilityRecommendationPanelModel } from '../../../../../lib/steps/ability-recommendation-panel.lib'
import type { AbilityRecommendationPanelProps } from './ability-recommendation-panel.types'

export type { AbilityRecommendationPanelProps } from './ability-recommendation-panel.types'

export function AbilityRecommendationPanel({
  classInput,
  classStepApplicable,
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
    if (!classStepApplicable) return null

    return (
      <Card tone="subtle" density="compact">
        <CardContent className="text-sm">
          <Text variant="muted" className="text-sm">
            {formatFieldMessage(characterBuilderAbilityRecommendationMessages.noClass())}
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card tone="subtle" density="compact">
      <CardContent className="text-sm">
        <p className="font-medium text-foreground">{model.heading}</p>
        <p className="text-muted-foreground">
          {model.benefitText}
          {model.suggestedText ? <> {model.suggestedText}</> : null}
          {model.showAction && model.suggestedAssignment && onApplySuggestions ? (
            <>
              {' '}
              <Button
                type="button"
                variant="text"
                tone="accent"
                size="sm"
                className="font-normal"
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
                variant="text"
                size="sm"
                className="font-normal"
                disabled
                aria-disabled="true"
              >
                {model.appliedLabel}
              </Button>
            </>
          ) : null}
        </p>
      </CardContent>
    </Card>
  )
}
