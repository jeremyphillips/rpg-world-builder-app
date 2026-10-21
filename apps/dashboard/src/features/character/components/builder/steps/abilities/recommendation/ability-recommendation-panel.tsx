import { useMemo } from 'react'

import { characterBuilderAbilityRecommendationMessages, formatFieldMessage } from '@rpg/contracts'
import { Alert, Button } from '@rpg/ui'

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
      <Alert
        variant="default"
        density="compact"
        announcement="none"
        description={formatFieldMessage(characterBuilderAbilityRecommendationMessages.noClass())}
      />
    )
  }

  const action =
    model.showAction && model.suggestedAssignment && onApplySuggestions ? (
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
    ) : model.showAppliedState ? (
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
    ) : null

  return (
    <Alert
      variant="default"
      density="compact"
      announcement="none"
      title={model.heading}
      description={
        <>
          {model.benefitText}
          {model.suggestedText ? <> {model.suggestedText}</> : null}
        </>
      }
      actions={action ?? undefined}
    />
  )
}
