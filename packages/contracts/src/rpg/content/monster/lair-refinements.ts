import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { CHALLENGE_RATING_MECHANICS, type ChallengeRating } from '../../vocab/challenge-rating'
import { suggestInLairExperience } from '../../runtime/monster/suggest-in-lair-experience'
import type { MonsterLair } from './lair-schema'

export const MONSTER_LAIR_CUSTOM_XP_MESSAGE = 'Enter an in-lair XP amount.'
export const MONSTER_LAIR_SUGGESTED_UNAVAILABLE_MESSAGE =
  'A suggested XP value is unavailable for this CR. Choose Custom or remove in-lair XP.'

export type MonsterLairPublishBody = {
  challengeRating: ChallengeRating
  lair?: MonsterLair
}

export function resolveMonsterInLairExperiencePoints(
  body: MonsterLairPublishBody,
): number | undefined {
  const lair = body.lair
  if (!lair?.enabled || !lair.experience) return undefined
  const mode = lair.experience.mode
  if (mode === 'custom') return lair.experience.value
  const suggestion = suggestInLairExperience(body.challengeRating)
  if (suggestion.status === 'unavailable') return undefined
  return suggestion.experiencePoints
}

export function refineMonsterLair(
  body: MonsterLairPublishBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const lair = body.lair
  if (!lair?.enabled || !lair.experience) return
  if (lair.experience.mode === 'custom' && lair.experience.value === undefined) {
    addCustomRefinementIssue(ctx, MONSTER_LAIR_CUSTOM_XP_MESSAGE, [
      ...prefix,
      'lair',
      'experience',
      'value',
    ])
  }
  if (lair.experience.mode === 'suggested') {
    const suggestion = suggestInLairExperience(body.challengeRating, CHALLENGE_RATING_MECHANICS)
    if (suggestion.status === 'unavailable') {
      addCustomRefinementIssue(ctx, MONSTER_LAIR_SUGGESTED_UNAVAILABLE_MESSAGE, [
        ...prefix,
        'lair',
        'experience',
        'mode',
      ])
    }
  }
}

export function isMonsterLairExperienceActive(lair: MonsterLair | undefined): boolean {
  return lair?.enabled === true && lair.experience !== undefined
}
