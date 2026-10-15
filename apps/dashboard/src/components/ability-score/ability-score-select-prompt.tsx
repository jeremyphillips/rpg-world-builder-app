import { ActionIcon, cn } from '@rpg/ui'

import {
  ABILITY_SCORE_SELECT_CHOOSE_LABEL,
  ABILITY_SCORE_SELECT_RELEASE_TO_ASSIGN_LABEL,
  abilityScoreCardChooseTriggerClasses,
  abilityScoreCardDragOverPreviewClasses,
  abilityScoreCardDragOverPreviewHintClasses,
  abilityScoreCardScoreValueClassesFor,
} from './ability-score-card.variants'

type AbilityScoreSelectChoosePromptProps = {
  className?: string
}

export function AbilityScoreSelectChoosePrompt({ className }: AbilityScoreSelectChoosePromptProps) {
  return (
    <span aria-hidden className={cn(abilityScoreCardChooseTriggerClasses, className)}>
      <ActionIcon action="add" step="sm" />
      {ABILITY_SCORE_SELECT_CHOOSE_LABEL}
    </span>
  )
}

type AbilityScoreSelectDragOverPreviewProps = {
  score: number
  size: 'sm' | 'md'
  className?: string
}

export function AbilityScoreSelectDragOverPreview({
  score,
  size,
  className,
}: AbilityScoreSelectDragOverPreviewProps) {
  return (
    <div className={cn(abilityScoreCardDragOverPreviewClasses, className)}>
      <span className={abilityScoreCardScoreValueClassesFor(size)}>{score}</span>
      <span className={abilityScoreCardDragOverPreviewHintClasses}>
        {ABILITY_SCORE_SELECT_RELEASE_TO_ASSIGN_LABEL}
      </span>
    </div>
  )
}
