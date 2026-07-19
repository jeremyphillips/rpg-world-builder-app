'use client'

import type { CharacterBuilderStepId } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import {
  getAdjacentBuilderStepId,
  isFirstBuilderStep,
  isReviewBuilderStep,
} from '../lib/character-builder-navigation'
import { characterBuilderShellFooterClasses } from './character-builder-shell.variants'

export type CharacterBuilderFooterProps = {
  currentStepId: CharacterBuilderStepId
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
  canCreateCharacter = true,
  createLabel,
  creatingLabel,
  reviewFooterHint,
  onBack,
  onContinue,
  onCreateCharacter,
  isCreating = false,
}: CharacterBuilderFooterProps) {
  const showBack = !isFirstBuilderStep(currentStepId)
  const onReview = isReviewBuilderStep(currentStepId)
  const canContinue = getAdjacentBuilderStepId(currentStepId, 'forward') !== null
  const createDisabled = isCreating || !canCreateCharacter

  return (
    <footer className={characterBuilderShellFooterClasses}>
      <div className="flex flex-col gap-2">
        {onReview && !canCreateCharacter ? (
          <Text variant="muted" className="text-sm">
            {reviewFooterHint}
          </Text>
        ) : null}

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
      </div>
    </footer>
  )
}
