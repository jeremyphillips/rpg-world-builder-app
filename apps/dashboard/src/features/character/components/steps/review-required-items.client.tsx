'use client'

import type { CharacterBuilderStepId, ReviewRequiredItem } from '@rpg/contracts'
import { formatReviewRequiredItemProgress } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

export type ReviewRequiredItemsProps = {
  requiredItems: readonly ReviewRequiredItem[]
  onNavigateToStep: (stepId: CharacterBuilderStepId) => void
}

export function ReviewRequiredItems({ requiredItems, onNavigateToStep }: ReviewRequiredItemsProps) {
  if (requiredItems.length === 0) return null

  return (
    <div className="space-y-2">
      <Text as="p" variant="body" className="font-medium">
        Required items
      </Text>
      <ul className="space-y-2">
        {requiredItems.map((item) => {
          const progress = formatReviewRequiredItemProgress(item)

          return (
            <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <Text as="p" variant="body" className="font-medium">
                    {item.label}
                  </Text>
                  <Text as="p" variant="muted">
                    {item.message}
                  </Text>
                  {progress ? (
                    <Text as="p" variant="muted" className="text-xs">
                      {progress}
                    </Text>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto shrink-0 px-0"
                  onClick={() => onNavigateToStep(item.stepId)}
                >
                  Go to {item.stepLabel}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
