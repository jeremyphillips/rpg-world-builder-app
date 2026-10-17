'use client'

import { ABILITY_ENTRIES, type Ability } from '@rpg/contracts'
import { Popover, PopoverContent, PopoverTrigger } from '@rpg/ui'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import {
  abilityScoreCardChooseOverlayClasses,
  type AbilityScoreCardState,
} from './ability-score-card.variants'
import type { FixedScoreSelectOption } from './fixed-score-select-option.types'
import {
  resolveAbilityScoreSelectCardProps,
  resolveAbilityScoreSelectDragPreview,
} from './ability-score-select.lib'
import { AbilityScoreSelectScoreRow } from './ability-score-select-score-row'
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
  /** Incoming score while `state` is `dragOver` (modifier + preview numeral). */
  pendingScore?: number
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
      pendingScore,
    },
    ref,
  ) {
    const fullName = ABILITY_ENTRIES[ability].label
    const filled = value !== null
    const chooseLabel = `Choose ${fullName} score`

    const dragOverPreviewScore = resolveAbilityScoreSelectDragPreview(state, pendingScore)
    const cardProps = resolveAbilityScoreSelectCardProps({
      filled,
      state,
      dragOverPreviewScore,
      value,
    })

    const card = (
      <AbilityScoreCard
        ref={ref}
        ability={ability}
        value={cardProps.modifierValue}
        size={size}
        state={state}
        headerAdornment={headerAdornment}
        hideModifier={cardProps.hideModifier}
        interaction={cardProps.interaction}
        scoreLayout={cardProps.scoreLayout}
      >
        {cardProps.isChooseCard ? (
          <PopoverTrigger asChild>
            <button
              type="button"
              className={abilityScoreCardChooseOverlayClasses}
              aria-label={chooseLabel}
            />
          </PopoverTrigger>
        ) : null}
        <AbilityScoreSelectScoreRow
          value={value}
          fullName={fullName}
          size={size}
          state={state}
          pendingScore={pendingScore}
          scoreDragHandleProps={scoreDragHandleProps}
          onOpenChange={onOpenChange}
        />
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
