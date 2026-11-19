import { useEffect, useId } from 'react'
import { CheckboxOption, Text } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_AWARDS_ZERO_XP_HINT,
  MONSTER_AWARDS_ZERO_XP_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

/** Zero-XP checkbox for challenge rating 0 — keeps transactional `setValue` out of display. */
export function MonsterChallengeRatingZeroXpField() {
  const hintId = useId()
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
    <div className="flex flex-col gap-2">
      <CheckboxOption
        shell="outlined"
        label={MONSTER_AWARDS_ZERO_XP_LABEL}
        checked={awardsZeroXp === 0}
        describedBy={hintId}
        onCheckedChange={(checked) =>
          form.setValue('experiencePointsOverride', checked ? 0 : undefined, {
            shouldDirty: true,
          })
        }
      />
      <Text id={hintId} variant="caption">
        {MONSTER_AWARDS_ZERO_XP_HINT}
      </Text>
    </div>
  )
}
