import type {
  AbilityScoreCardScoreLayout,
  AbilityScoreCardState,
} from './ability-score-card.variants'

export function resolveAbilityScoreSelectDragPreview(
  state: AbilityScoreCardState,
  pendingScore: number | undefined,
): number | undefined {
  return state === 'dragOver' ? pendingScore : undefined
}

export function resolveAbilityScoreSelectCardProps({
  filled,
  state,
  dragOverPreviewScore,
  value,
}: {
  filled: boolean
  state: AbilityScoreCardState
  dragOverPreviewScore: number | undefined
  value: number | null
}): {
  isChooseCard: boolean
  modifierValue: number | null
  hideModifier: boolean
  interaction: 'none' | 'select'
  scoreLayout: AbilityScoreCardScoreLayout
} {
  const isChooseCard = !filled && state !== 'dragOver'

  return {
    isChooseCard,
    modifierValue: dragOverPreviewScore ?? value,
    hideModifier: state === 'dragOver' && dragOverPreviewScore === undefined,
    interaction: isChooseCard && state === 'resting' ? 'select' : 'none',
    scoreLayout: state === 'dragOver' ? 'centered' : filled ? 'select-filled' : 'choose',
  }
}
