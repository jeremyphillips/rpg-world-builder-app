'use client'

import type { HTMLAttributes } from 'react'

import type { AbilityScoreCardState } from './ability-score-card.variants'
import { AbilityScoreSelectFilledRow } from './ability-score-select-filled-row'
import { resolveAbilityScoreSelectDragPreview } from './ability-score-select.lib'
import {
  AbilityScoreSelectChoosePrompt,
  AbilityScoreSelectDragOverPreview,
} from './ability-score-select-prompt'

type AbilityScoreSelectScoreRowProps = {
  value: number | null
  fullName: string
  size: 'sm' | 'md'
  state: AbilityScoreCardState
  pendingScore?: number
  scoreDragHandleProps?: HTMLAttributes<HTMLElement>
  onOpenChange?: (open: boolean) => void
}

export function AbilityScoreSelectScoreRow({
  value,
  fullName,
  size,
  state,
  pendingScore,
  scoreDragHandleProps,
  onOpenChange,
}: AbilityScoreSelectScoreRowProps) {
  const dragOverPreviewScore = resolveAbilityScoreSelectDragPreview(state, pendingScore)

  if (dragOverPreviewScore !== undefined) {
    return <AbilityScoreSelectDragOverPreview score={dragOverPreviewScore} size={size} />
  }

  if (state === 'dragOver') {
    return null
  }

  if (value !== null) {
    return (
      <AbilityScoreSelectFilledRow
        value={value}
        fullName={fullName}
        size={size}
        state={state}
        scoreDragHandleProps={scoreDragHandleProps}
        onOpenChange={onOpenChange}
      />
    )
  }

  return <AbilityScoreSelectChoosePrompt />
}
