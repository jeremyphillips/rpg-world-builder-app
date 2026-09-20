import { formatProficiencyChosenCounter } from '@rpg/contracts'
import { SemanticText, StatusIcon, Text } from '@rpg/ui'

import { isChoiceSetAtCapacity } from '../../../../lib/choice-sets/selection-counter.lib'
import {
  proficiencySelectionCounterClasses,
  proficiencySelectionCounterLabelClasses,
} from './proficiency-selection-counter.variants'

export type ProficiencySelectionCounterProps = {
  selectedCount: number
  max: number
}

export function ProficiencySelectionCounter({
  selectedCount,
  max,
}: ProficiencySelectionCounterProps) {
  const label = formatProficiencyChosenCounter(selectedCount, max)
  const isComplete = isChoiceSetAtCapacity(selectedCount, max)

  if (!isComplete) {
    return (
      <Text variant="muted" className={proficiencySelectionCounterLabelClasses}>
        {label}
      </Text>
    )
  }

  return (
    <span className={proficiencySelectionCounterClasses}>
      <StatusIcon variant="ready" size="sm" tooltip={false} />
      <SemanticText
        tone="success"
        emphasis="medium"
        className={proficiencySelectionCounterLabelClasses}
      >
        {label}
      </SemanticText>
    </span>
  )
}
