'use client'

import type { CharacterBuilderStepId } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import {
  getAdjacentBuilderStepId,
  isFirstBuilderStep,
  isReviewBuilderStep,
} from '../lib/character-builder-navigation'
import { characterBuilderShellFooterClasses } from './character-builder-shell.variants'

export type CharacterBuilderFooterProps = {
  currentStepId: CharacterBuilderStepId
  continueFormId?: string
  onBack: () => void
  onContinue: () => void
  onCreateCharacter: () => void
  isCreating?: boolean
}

export function CharacterBuilderFooter({
  currentStepId,
  continueFormId,
  onBack,
  onContinue,
  onCreateCharacter,
  isCreating = false,
}: CharacterBuilderFooterProps) {
  const showBack = !isFirstBuilderStep(currentStepId)
  const onReview = isReviewBuilderStep(currentStepId)
  const canContinue = getAdjacentBuilderStepId(currentStepId, 'forward') !== null

  return (
    <footer className={characterBuilderShellFooterClasses}>
      <div className="flex flex-wrap items-center gap-2">
        {showBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : null}

        {onReview ? (
          <Button type="button" disabled={isCreating} onClick={onCreateCharacter}>
            Create character
          </Button>
        ) : canContinue && continueFormId ? (
          <Button type="submit" form={continueFormId}>
            Continue
          </Button>
        ) : canContinue ? (
          <Button type="button" onClick={onContinue}>
            Continue
          </Button>
        ) : null}
      </div>
    </footer>
  )
}
