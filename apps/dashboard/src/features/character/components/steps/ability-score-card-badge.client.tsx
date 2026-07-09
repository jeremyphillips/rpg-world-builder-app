'use client'

import {
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
  type AbilityRecommendation,
  type Ability,
} from '@rpg/contracts'
import { Eyebrow } from '@rpg/ui'

import { abilityRecommendationBadgeSlotClasses } from './ability-recommendation.variants'

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
        <Eyebrow size="xs" tone="foreground">
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgePrimary())}
        </Eyebrow>
      ) : null}
      {isSecondary ? (
        <Eyebrow size="xs" tone="muted">
          {formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgeSecondary())}
        </Eyebrow>
      ) : null}
    </div>
  )
}
