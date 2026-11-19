import {
  CHALLENGE_RATING_MECHANICS,
  formatMonsterChallengeMetadata,
  type ChallengeRating,
} from '@rpg/contracts'
import type { DisplayConfig } from '@rpg/ui/form'

import { MONSTER_BLANK_CHALLENGE_HINT } from '../monster-form-labels'

export function monsterChallengeRatingMetadataDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'challenge-rating-metadata',
    resolve: {
      dependsOn: ['challengeRating', 'experiencePointsOverride'],
      contentWhen: (values) => {
        const challengeRating = values.challengeRating
        if (typeof challengeRating !== 'string' || challengeRating.length === 0) {
          return { variant: 'text', text: MONSTER_BLANK_CHALLENGE_HINT, role: 'supporting' }
        }

        const mechanics = CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating]
        const awardsZeroXp = values.experiencePointsOverride
        const xp = challengeRating === '0' && awardsZeroXp === 0 ? 0 : mechanics.xp

        return {
          variant: 'text',
          text: formatMonsterChallengeMetadata({
            experiencePoints: xp,
            proficiencyBonus: mechanics.proficiencyBonus,
          }),
          role: 'supporting',
        }
      },
    },
  }
}
