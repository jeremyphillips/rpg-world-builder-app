'use client'

import { ABILITY_ENTRIES, type Ability } from '@rpg/contracts'
import { ActionIcon, cn, Popover, PopoverContent, PopoverTrigger } from '@rpg/ui'
import { ArrowDown } from 'lucide-react'
import { useCallback, type HTMLAttributes, type ReactNode } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import {
  abilityScoreCardScoreCenterClasses,
  abilityScoreCardScoreValueClasses,
  type AbilityScoreCardState,
} from './ability-score-card.variants'
import {
  AbilityScoreSelectScoreGrid,
  type AbilityScoreSelectUsedBy,
} from './ability-score-select-score-grid'

export type AbilityScoreSelectProps = {
  ability: Ability
  value: number | null
  scores: readonly number[]
  usedBy?: Readonly<Partial<Record<number, AbilityScoreSelectUsedBy>>>
  onSelect: (score: number) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  state?: AbilityScoreCardState
  size?: 'sm' | 'md'
  className?: string
  headerAdornment?: ReactNode
  scoreDragHandleProps?: HTMLAttributes<HTMLElement>
}

export function AbilityScoreSelect({
  ability,
  value,
  scores,
  usedBy,
  onSelect,
  open,
  onOpenChange,
  state = 'resting',
  size = 'md',
  className,
  headerAdornment,
  scoreDragHandleProps,
}: AbilityScoreSelectProps) {
  const fullName = ABILITY_ENTRIES[ability].label
  const filled = value !== null

  const handleSelect = useCallback(
    (score: number) => {
      if (score === value) {
        onOpenChange?.(false)
        return
      }
      onSelect(score)
      onOpenChange?.(false)
    },
    [onOpenChange, onSelect, value],
  )

  const centerContent =
    state === 'dragOver' ? (
      <div
        className={cn(
          abilityScoreCardScoreCenterClasses,
          'flex items-center justify-center gap-1 text-style-label',
        )}
      >
        <ArrowDown aria-hidden className="size-4" />
        Drop
      </div>
    ) : filled ? (
      <button
        type="button"
        className={cn(
          abilityScoreCardScoreCenterClasses,
          abilityScoreCardScoreValueClasses[size],
          state === 'draggingFrom' && 'opacity-50',
          scoreDragHandleProps?.className,
        )}
        tabIndex={scoreDragHandleProps ? 0 : undefined}
        onClick={() => onOpenChange?.(true)}
        {...scoreDragHandleProps}
      >
        {value}
      </button>
    ) : (
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            abilityScoreCardScoreCenterClasses,
            'inline-flex items-center justify-center gap-1 text-style-label',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`Choose ${fullName} score`}
        >
          <ArrowDown aria-hidden className="size-4" />
          Choose
        </button>
      </PopoverTrigger>
    )

  const rightContent =
    filled && state !== 'dragOver' ? (
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex size-control-action-compact items-center justify-center rounded-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`Change ${fullName} score`}
        >
          <ActionIcon action="edit" step="sm" />
        </button>
      </PopoverTrigger>
    ) : (
      <span aria-hidden />
    )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <AbilityScoreCard
        ability={ability}
        value={value}
        size={size}
        state={state}
        headerAdornment={headerAdornment}
        hideModifier={state === 'dragOver'}
        restingHover={state === 'resting'}
        className={className}
      >
        <span aria-hidden />
        {centerContent}
        {rightContent}
      </AbilityScoreCard>
      <PopoverContent side="right" align="center" arrow collisionPadding={8}>
        <AbilityScoreSelectScoreGrid
          scores={scores}
          currentValue={value}
          usedBy={usedBy}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
