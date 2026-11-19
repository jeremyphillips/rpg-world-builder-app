'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_AWARDS_ZERO_XP_HINT,
  MONSTER_AWARDS_ZERO_XP_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

/** Zero-XP checkbox for challenge rating 0 — keeps transactional `setValue` out of display. */
export function MonsterChallengeRatingZeroXpField() {
  const form = useFormContext<MonsterFormValues>()
  const challengeRating = useWatch<MonsterFormValues, 'challengeRating'>({
    name: 'challengeRating',
  })
  const awardsZeroXp = useWatch<MonsterFormValues, 'experiencePointsOverride'>({
    name: 'experiencePointsOverride',
  })

  if (challengeRating !== '0') return null

  return (
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
  )
}
