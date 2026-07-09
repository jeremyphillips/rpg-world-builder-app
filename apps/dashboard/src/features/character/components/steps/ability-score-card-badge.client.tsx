'use client'

import {
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
  type AbilityRecommendation,
  type Ability,
} from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import {
  abilityRecommendationBadgeSecondaryClasses,
  abilityRecommendationBadgeSlotClasses,
} from './ability-recommendation.variants'

export type AbilityScoreCardBadgeProps = {
  ability: Ability
  recommendation: AbilityRecommendation | null
}

/** Compact reserved badge slot above ability cards; empty space when not recommended. */
export function AbilityScoreCardBadge({ ability, recommendation }: AbilityScoreCardBadgeProps) {
  const isPrimary = recommendation?.primary.includes(ability) ?? false
  const isSecondary = recommendation?.secondary.includes(ability) ?? false

  return (
    <div className={abilityRecommendationBadgeSlotClasses} aria-hidden={!isPrimary && !isSecondary}>
      {isPrimary ? (
        <Badge size="sm" variant="secondary">
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgePrimary())}
        </Badge>
      ) : null}
      {isSecondary ? (
        <Badge size="sm" variant="outline" className={abilityRecommendationBadgeSecondaryClasses}>
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgeSecondary())}
        </Badge>
      ) : null}
    </div>
  )
}
