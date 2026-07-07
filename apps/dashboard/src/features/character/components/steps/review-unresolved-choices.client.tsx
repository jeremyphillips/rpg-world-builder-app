'use client'

import type { CharacterBuilderStepId, UnresolvedChoiceSetSummary } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

export type ReviewUnresolvedChoicesProps = {
  unresolvedChoices: readonly UnresolvedChoiceSetSummary[]
  onNavigateToStep: (stepId: CharacterBuilderStepId) => void
}

export function ReviewUnresolvedChoices({
  unresolvedChoices,
  onNavigateToStep,
}: ReviewUnresolvedChoicesProps) {
  if (unresolvedChoices.length === 0) return null

  return (
    <div className="space-y-2">
      <Text as="p" variant="body" className="font-medium">
        Unresolved choices
      </Text>
      <ul className="space-y-2">
        {unresolvedChoices.map((choice) => (
          <li
            key={choice.choiceSetId}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <Text as="p" variant="body" className="font-medium">
                  {choice.label}
                </Text>
                <Text as="p" variant="muted">
                  {choice.message}
                </Text>
                <Text as="p" variant="muted" className="text-xs">
                  {formatChoiceProgress(choice.selectedCount, choice.min, choice.max)}
                </Text>
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto shrink-0 px-0"
                onClick={() => onNavigateToStep(choice.stepId)}
              >
                Go to {choice.stepLabel}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatChoiceProgress(selectedCount: number, min: number, max: number): string {
  if (min === max) {
    return `${selectedCount} of ${min} selected`
  }

  return `${selectedCount} selected (${min}–${max} required)`
}
