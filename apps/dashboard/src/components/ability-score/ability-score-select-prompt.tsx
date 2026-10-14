import { cn } from '@rpg/ui'
import { ArrowDown } from 'lucide-react'

import {
  abilityScoreCardSelectPromptClasses,
  abilityScoreCardSelectPromptIconClasses,
  abilityScoreCardSelectPromptLabelClasses,
} from './ability-score-card.variants'

type AbilityScoreSelectPromptProps = {
  label: 'Choose' | 'Drop'
  className?: string
}

export function AbilityScoreSelectPrompt({ label, className }: AbilityScoreSelectPromptProps) {
  return (
    <div className={cn(abilityScoreCardSelectPromptClasses, className)}>
      <ArrowDown aria-hidden className={abilityScoreCardSelectPromptIconClasses} />
      <span className={abilityScoreCardSelectPromptLabelClasses}>{label}</span>
    </div>
  )
}
