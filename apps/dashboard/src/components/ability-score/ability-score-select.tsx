'use client'

import { ABILITY_ENTRIES, type Ability } from '@rpg/contracts'
import { ActionIcon, cn, Popover, PopoverContent, PopoverTrigger } from '@rpg/ui'
import { ArrowDown } from 'lucide-react'
import { forwardRef, useCallback, type HTMLAttributes, type ReactNode } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import {
  abilityScoreCardScoreCenterClasses,
  abilityScoreCardScoreValueClassesFor,
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
  headerAdornment?: ReactNode
  scoreDragHandleProps?: HTMLAttributes<HTMLElement>
}

export const AbilityScoreSelect = forwardRef<HTMLElement, AbilityScoreSelectProps>(
  function AbilityScoreSelect(
    {
      ability,
      value,
      scores,
      usedBy,
      onSelect,
      open,
      onOpenChange,
      state = 'resting',
      size = 'md',
      headerAdornment,
      scoreDragHandleProps,
    },
    ref,
  ) {
    const fullName = ABILITY_ENTRIES[ability].label
    const filled = value !== null
    const {
      onClick: scoreDragHandleOnClick,
      className: scoreDragHandleClassName,
      ...scoreDragHandleRest
    } = scoreDragHandleProps ?? {}

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
            abilityScoreCardScoreValueClassesFor(size),
            state === 'draggingFrom' && 'opacity-50',
            scoreDragHandleClassName,
          )}
          tabIndex={scoreDragHandleProps ? 0 : undefined}
          onClick={(event) => {
            scoreDragHandleOnClick?.(event)
            if (!event.defaultPrevented) {
              onOpenChange?.(true)
            }
          }}
          {...scoreDragHandleRest}
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
          ref={ref}
          ability={ability}
          value={value}
          size={size}
          state={state}
          headerAdornment={headerAdornment}
          hideModifier={state === 'dragOver'}
          interaction={state === 'resting' ? 'select' : 'none'}
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
  },
)
