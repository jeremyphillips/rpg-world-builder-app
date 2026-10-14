'use client'

import { useId } from 'react'

import { cn, RadioGroup, RadioGroupItem } from '@rpg/ui'

export type AbilityScoreSelectUsedBy = {
  abilityLabel: string
  compactLabel: string
}

export type AbilityScoreSelectScoreGridProps = {
  scores: readonly number[]
  currentValue: number | null
  usedBy?: Readonly<Partial<Record<number, AbilityScoreSelectUsedBy>>>
  onSelect: (score: number) => void
}

const tileBaseClasses = cn(
  'flex w-full flex-col items-center justify-center rounded-md border',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

export function AbilityScoreSelectScoreGrid({
  scores,
  currentValue,
  usedBy,
  onSelect,
}: AbilityScoreSelectScoreGridProps) {
  const titleId = useId()
  const sorted = [...scores].sort((left, right) => left - right)

  const handleValueChange = (next: string) => {
    const index = Number(next)
    const score = sorted[index]
    if (score === undefined) return
    if (usedBy?.[score]) return
    onSelect(score)
  }

  const selectedIndex =
    currentValue === null ? undefined : String(sorted.findIndex((score) => score === currentValue))

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
        {sorted.map((score, index) => {
          const owner = usedBy?.[score]
          const isCurrent = currentValue === score
          const unavailable = Boolean(owner) && !isCurrent
          const tileLabel = owner ? `Used by ${owner.compactLabel}` : String(score)

          return (
            <RadioGroupItem
              key={index}
              variant="tile"
              value={String(index)}
              aria-disabled={unavailable || undefined}
              aria-label={tileLabel}
              className={cn(
                tileBaseClasses,
                'min-h-12 tabular-nums text-style-label',
                isCurrent
                  ? 'border-primary bg-surface-strong'
                  : unavailable
                    ? 'border-border bg-muted text-muted-foreground'
                    : 'border-border bg-background hover:bg-muted',
              )}
              onClick={(event) => {
                if (unavailable) {
                  event.preventDefault()
                }
              }}
            >
              <span>{score}</span>
              {owner ? (
                <span className="whitespace-nowrap text-control-action-xs text-muted-foreground">
                  Used by {owner.compactLabel}
                </span>
              ) : null}
            </RadioGroupItem>
          )
        })}
      </RadioGroup>
    </div>
  )
}
