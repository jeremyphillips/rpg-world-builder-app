import { formatChoiceChosenCounter } from '@rpg/contracts'
import { SemanticText, StatusIcon, Text } from '@rpg/ui'

import { isChoiceSetAtCapacity } from '../../../../../lib/choice-sets/selection-counter.lib'
import {
  choiceSelectionCounterClasses,
  choiceSelectionCounterLabelClasses,
} from './choice-selection-counter.variants'

export type ChoiceSelectionCounterProps = {
  selectedCount: number
  max: number
}

export function ChoiceSelectionCounter({ selectedCount, max }: ChoiceSelectionCounterProps) {
  const label = formatChoiceChosenCounter(selectedCount, max)
  const isComplete = isChoiceSetAtCapacity(selectedCount, max)

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
