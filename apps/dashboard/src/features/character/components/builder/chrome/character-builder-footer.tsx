import type { BuilderStep } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'
import { Button, Text } from '@rpg/ui'
import { FormActionsBar } from '@rpg/ui/form'

import {
  getAdjacentBuilderStepId,
  isFirstBuilderStep,
  isReviewBuilderStep,
} from '../../../lib/builder/character-builder-navigation'

export type CharacterBuilderFooterProps = {
  currentStepId: CharacterBuilderStepId
  steps?: readonly BuilderStep[]
  canCreateCharacter?: boolean
  createLabel: string
  creatingLabel: string
  reviewFooterHint: string
  onBack: () => void
  onContinue: () => void
  onCreateCharacter: () => void
  isCreating?: boolean
}

export function CharacterBuilderFooter({
  currentStepId,
  steps,
  canCreateCharacter = true,
  createLabel,
  creatingLabel,
  reviewFooterHint,
  onBack,
  onContinue,
  onCreateCharacter,
  isCreating = false,
}: CharacterBuilderFooterProps) {
  const showBack = !isFirstBuilderStep(currentStepId, steps)
  const onReview = isReviewBuilderStep(currentStepId)
  const canContinue = getAdjacentBuilderStepId(currentStepId, 'forward', steps) !== null
  const createDisabled = isCreating || !canCreateCharacter

  return (
    <FormActionsBar
      placement="docked"
      validationSummary={
        onReview && !canCreateCharacter ? (
          <Text variant="muted" className="mb-3 text-sm">
            {reviewFooterHint}
          </Text>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {showBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : null}

        {onReview ? (
          <Button type="button" disabled={createDisabled} onClick={onCreateCharacter}>
            {isCreating ? creatingLabel : createLabel}
          </Button>
        ) : canContinue ? (
          <Button type="button" onClick={onContinue}>
            Continue
          </Button>
        ) : null}
      </div>
    </FormActionsBar>
  )
}
