import { useFormContext, useWatch } from 'react-hook-form'
import {
  CHALLENGE_RATING_MECHANICS,
  formatMonsterChallengeMetadata,
  type ChallengeRating,
} from '@rpg/contracts'

import {
  MONSTER_AWARDS_ZERO_XP_HINT,
  MONSTER_AWARDS_ZERO_XP_LABEL,
  MONSTER_BLANK_CHALLENGE_HINT,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export function MonsterChallengeRatingHint() {
  const form = useFormContext<MonsterFormValues>()
  const challengeRating = useWatch<MonsterFormValues, 'challengeRating'>({
    name: 'challengeRating',
  })
  const awardsZeroXp = useWatch<MonsterFormValues, 'experiencePointsOverride'>({
    name: 'experiencePointsOverride',
  })

  if (!challengeRating) {
    return <p>{MONSTER_BLANK_CHALLENGE_HINT}</p>
  }

  const mechanics = CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating]
  const xp = challengeRating === '0' && awardsZeroXp === 0 ? 0 : mechanics.xp

  return (
    <div>
      <p>
        {formatMonsterChallengeMetadata({
          experiencePoints: xp,
          proficiencyBonus: mechanics.proficiencyBonus,
        })}
      </p>
      {challengeRating === '0' ? (
        <label>
          <input
            type="checkbox"
            aria-label={MONSTER_AWARDS_ZERO_XP_LABEL}
            checked={awardsZeroXp === 0}
            onChange={(event) =>
              form.setValue('experiencePointsOverride', event.target.checked ? 0 : undefined, {
                shouldDirty: true,
              })
            }
          />
          {MONSTER_AWARDS_ZERO_XP_LABEL}
          <span>{MONSTER_AWARDS_ZERO_XP_HINT}</span>
        </label>
      ) : null}
    </div>
  )
}
