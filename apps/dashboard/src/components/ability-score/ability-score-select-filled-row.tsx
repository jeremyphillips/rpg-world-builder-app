'use client'

import { ActionIcon, cn, PopoverTrigger } from '@rpg/ui'
import type { HTMLAttributes, MouseEvent } from 'react'

import {
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardSelectFilledBalanceSlotClasses,
  abilityScoreCardSelectFilledClusterClasses,
  abilityScoreCardSelectInlineNumeralClasses,
  abilityScoreCardSelectPencilButtonClasses,
  type AbilityScoreCardState,
} from './ability-score-card.variants'

type AbilityScoreSelectFilledRowProps = {
  value: number
  fullName: string
  size: 'sm' | 'md'
  state: AbilityScoreCardState
  scoreDragHandleProps?: HTMLAttributes<HTMLElement>
  onOpenChange?: (open: boolean) => void
}

export function AbilityScoreSelectFilledRow({
  value,
  fullName,
  size,
  state,
  scoreDragHandleProps,
  onOpenChange,
}: AbilityScoreSelectFilledRowProps) {
  const {
    onClick: scoreDragHandleOnClick,
    className: scoreDragHandleClassName,
    ...scoreDragHandleRest
  } = scoreDragHandleProps ?? {}

  const inlineNumeralClasses = cn(
    abilityScoreCardSelectInlineNumeralClasses,
    abilityScoreCardScoreValueClassesFor(size),
  )

  return (
    <div className={abilityScoreCardSelectFilledClusterClasses}>
      <span aria-hidden className={abilityScoreCardSelectFilledBalanceSlotClasses} />
      <button
        type="button"
        className={cn(
          inlineNumeralClasses,
          state === 'draggingFrom' && 'opacity-50',
          scoreDragHandleClassName,
        )}
        tabIndex={scoreDragHandleProps ? 0 : undefined}
        onClick={(event: MouseEvent<HTMLElement>) => {
          scoreDragHandleOnClick?.(event)
          if (!event.defaultPrevented) {
            onOpenChange?.(true)
          }
        }}
        {...scoreDragHandleRest}
      >
        {value}
      </button>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            abilityScoreCardSelectPencilButtonClasses,
            'size-control-action-compact justify-self-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`Change ${fullName} score`}
        >
          <ActionIcon action="edit" step="sm" />
        </button>
      </PopoverTrigger>
    </div>
  )
}
