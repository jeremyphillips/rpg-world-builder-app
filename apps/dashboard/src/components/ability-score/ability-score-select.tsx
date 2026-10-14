'use client'

import { ABILITY_ENTRIES, type Ability } from '@rpg/contracts'
import { ActionIcon, cn, Popover, PopoverContent, PopoverTrigger } from '@rpg/ui'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import {
  abilityScoreCardChooseOverlayClasses,
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardSelectFilledBalanceSlotClasses,
  abilityScoreCardSelectFilledClusterClasses,
  abilityScoreCardSelectInlineNumeralClasses,
  abilityScoreCardSelectPencilButtonClasses,
  type AbilityScoreCardState,
} from './ability-score-card.variants'
import type { FixedScoreSelectOption } from './fixed-score-select-option.types'
import { AbilityScoreSelectPrompt } from './ability-score-select-prompt'
import { AbilityScoreSelectScoreGrid } from './ability-score-select-score-grid'

export type AbilityScoreSelectProps = {
  ability: Ability
  value: number | null
  scoreOptions: readonly FixedScoreSelectOption[]
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
      scoreOptions,
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

    const inlineNumeralClasses = cn(
      abilityScoreCardSelectInlineNumeralClasses,
      abilityScoreCardScoreValueClassesFor(size),
    )

    const chooseLabel = `Choose ${fullName} score`
    const isChooseCard = !filled && state !== 'dragOver'

    const scoreRow =
      state === 'dragOver' ? (
        <AbilityScoreSelectPrompt label="Drop" />
      ) : filled ? (
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
      ) : (
        <AbilityScoreSelectPrompt className="pointer-events-none" label="Choose" />
      )

    const card = (
      <AbilityScoreCard
        ref={ref}
        ability={ability}
        value={value}
        size={size}
        state={state}
        headerAdornment={headerAdornment}
        hideModifier={state === 'dragOver'}
        interaction={state === 'resting' ? 'select' : 'none'}
        scoreLayout={state === 'dragOver' ? 'centered' : filled ? 'select-filled' : 'choose'}
      >
        {isChooseCard ? (
          <PopoverTrigger asChild>
            <button
              type="button"
              className={abilityScoreCardChooseOverlayClasses}
              aria-label={chooseLabel}
            />
          </PopoverTrigger>
        ) : null}
        {scoreRow}
      </AbilityScoreCard>
    )

    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        {card}
        <PopoverContent side="right" align="center" arrow collisionPadding={8}>
          <AbilityScoreSelectScoreGrid
            scoreOptions={scoreOptions}
            currentValue={value}
            onSelect={onSelect}
          />
        </PopoverContent>
      </Popover>
    )
  },
)
