import { useEffect } from 'react'
import { CheckboxOption } from '@rpg/ui'
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

  useEffect(() => {
    form.register('experiencePointsOverride', { shouldUnregister: false })
  }, [form])

  if (challengeRating !== '0') return null

  return (
    <CheckboxOption
      label={MONSTER_AWARDS_ZERO_XP_LABEL}
      hint={MONSTER_AWARDS_ZERO_XP_HINT}
      checked={awardsZeroXp === 0}
      onCheckedChange={(checked) =>
        form.setValue('experiencePointsOverride', checked ? 0 : undefined, {
          shouldDirty: true,
        })
      }
    />
  )
}
