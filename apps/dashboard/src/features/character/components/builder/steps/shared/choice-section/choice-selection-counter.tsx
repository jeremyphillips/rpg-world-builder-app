import { formatChoiceChosenCounter, type ChoiceCounterVerb } from '@rpg/contracts'
import { SemanticText, StatusIcon, Text } from '@rpg/ui'

import {
  choiceSelectionCounterClasses,
  choiceSelectionCounterLabelClasses,
} from './choice-selection-counter.variants'

export type ChoiceSelectionCounterProps = {
  selectedCount: number
  max: number
  verb?: ChoiceCounterVerb
  requiredToComplete?: boolean
  effectiveRequiredCount?: number
}

function isRequirementStyleSuccess({
  selectedCount,
  max,
  requiredToComplete = true,
  effectiveRequiredCount,
}: ChoiceSelectionCounterProps): boolean {
  if (!requiredToComplete || max <= 0) return false
  if (selectedCount > max) return false

  const threshold = effectiveRequiredCount ?? max
  return selectedCount >= threshold
}

export function ChoiceSelectionCounter(props: ChoiceSelectionCounterProps) {
  const { selectedCount, max, verb = 'chosen' } = props
  const label = formatChoiceChosenCounter(selectedCount, max, verb)
  const isComplete = isRequirementStyleSuccess(props)

  if (!isComplete) {
    return (
      <Text variant="muted" className={choiceSelectionCounterLabelClasses}>
        {label}
      </Text>
    )
  }

  return (
    <span className={choiceSelectionCounterClasses}>
      <StatusIcon variant="ready" size="sm" tooltip={false} />
      <SemanticText tone="success" emphasis="medium" className={choiceSelectionCounterLabelClasses}>
        {label}
      </SemanticText>
    </span>
  )
}
