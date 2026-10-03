'use client'

import { formatChoiceChosenCounter, type ChoiceCounterVerb } from '@rpg/contracts'

import { StatusIcon } from './status-icon.client'
import {
  CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
  choiceSelectionCounterCompleteLabelVariants,
  choiceSelectionCounterIncompleteLabelVariants,
  choiceSelectionCounterStatusIconSize,
  choiceSelectionCounterVariants,
  type ChoiceSelectionCounterSize,
} from './choice-selection-counter.variants'

export type ChoiceSelectionCounterProps = {
  selectedCount: number
  max: number
  verb?: ChoiceCounterVerb
  requiredToComplete?: boolean
  effectiveRequiredCount?: number
  size?: ChoiceSelectionCounterSize
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
  if (threshold <= 0) return false
  return selectedCount >= threshold
}

export function ChoiceSelectionCounter(props: ChoiceSelectionCounterProps) {
  const {
    selectedCount,
    max,
    verb = 'chosen',
    size = CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
  } = props
  const label = formatChoiceChosenCounter(selectedCount, max, verb)
  const isComplete = isRequirementStyleSuccess(props)
  const statusIconSize = choiceSelectionCounterStatusIconSize[size]

  if (!isComplete) {
    return <span className={choiceSelectionCounterIncompleteLabelVariants({ size })}>{label}</span>
  }

  return (
    <span className={choiceSelectionCounterVariants({ size })}>
      <StatusIcon variant="ready" size={statusIconSize} tooltip={false} />
      <span className={choiceSelectionCounterCompleteLabelVariants({ size })}>{label}</span>
    </span>
  )
}
