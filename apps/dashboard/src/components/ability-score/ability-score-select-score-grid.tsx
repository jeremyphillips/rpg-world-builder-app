'use client'

import { useId } from 'react'

import { cn, RadioGroup, RadioGroupItem } from '@rpg/ui'

import type { FixedScoreSelectOption } from './fixed-score-select-option.types'

export type AbilityScoreSelectScoreGridProps = {
  scoreOptions: readonly FixedScoreSelectOption[]
  currentValue: number | null
  onSelect: (score: number) => void
}

const tileBaseClasses = cn(
  'flex w-full flex-col items-center justify-center rounded-md border',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

function isSelectableOperation(operation: FixedScoreSelectOption['operation']): boolean {
  return operation === 'assign' || operation === 'move' || operation === 'swap'
}

export function AbilityScoreSelectScoreGrid({
  scoreOptions,
  currentValue,
  onSelect,
}: AbilityScoreSelectScoreGridProps) {
  const titleId = useId()

  const selectedIndex =
    currentValue === null
      ? undefined
      : String(scoreOptions.findIndex((option) => option.score === currentValue))

  const handleValueChange = (next: string) => {
    const index = Number(next)
    const option = scoreOptions[index]
    if (!option || !isSelectableOperation(option.operation)) return
    onSelect(option.score)
  }

  return (
    <div className="flex w-64 flex-col gap-2 p-3">
      <p id={titleId} className="text-style-label">
        Choose a score
      </p>
      <RadioGroup
        className="grid grid-cols-3 gap-2"
        orientation="horizontal"
        aria-labelledby={titleId}
        value={selectedIndex !== '-1' ? selectedIndex : undefined}
        onValueChange={handleValueChange}
      >
        {scoreOptions.map((option, index) => {
          const isCurrent = option.operation === 'current'
          const isInvalid = option.operation === 'invalid'

          return (
            <RadioGroupItem
              key={index}
              variant="tile"
              value={String(index)}
              aria-disabled={isInvalid || undefined}
              aria-label={option.ariaLabel}
              className={cn(
                tileBaseClasses,
                'min-h-12 tabular-nums text-style-label',
                isCurrent
                  ? 'border-primary bg-surface-strong'
                  : isInvalid
                    ? 'border-border bg-muted text-muted-foreground'
                    : 'border-border bg-background hover:bg-muted',
              )}
              onClick={(event) => {
                if (isInvalid) {
                  event.preventDefault()
                }
              }}
            >
              <span>{option.score}</span>
              {option.secondaryLabel ? (
                <span className="max-w-full truncate whitespace-nowrap text-control-action-xs text-muted-foreground">
                  {option.secondaryLabel}
                </span>
              ) : null}
            </RadioGroupItem>
          )
        })}
      </RadioGroup>
    </div>
  )
}
