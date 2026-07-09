'use client'

import {
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
  type AbilityRecommendation,
  type Ability,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  abilityRecommendationBadgePrimaryClasses,
  abilityRecommendationBadgeSecondaryClasses,
  abilityRecommendationBadgeSlotClasses,
} from './ability-recommendation.variants'

export type AbilityScoreCardBadgeProps = {
  ability: Ability
  recommendation: AbilityRecommendation | null
}

/** Compact reserved label slot above ability cards; empty space when not recommended. */
export function AbilityScoreCardBadge({ ability, recommendation }: AbilityScoreCardBadgeProps) {
  const isPrimary = recommendation?.primary.includes(ability) ?? false
  const isSecondary = recommendation?.secondary.includes(ability) ?? false

  return (
    <div className={abilityRecommendationBadgeSlotClasses} aria-hidden={!isPrimary && !isSecondary}>
      {isPrimary ? (
        <Text as="span" className={abilityRecommendationBadgePrimaryClasses}>
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgePrimary())}
        </Text>
      ) : null}
      {isSecondary ? (
        <Text as="span" className={abilityRecommendationBadgeSecondaryClasses}>
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgeSecondary())}
        </Text>
      ) : null}
    </div>
  )
}
