import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import {
  CHALLENGE_RATING_MECHANICS,
  resolveMonsterBaseExperiencePoints,
  suggestInLairExperience,
  type ChallengeRating,
} from '../../vocab/challenge-rating'
import { monsterLairInLairXpMustExceedBaseMessage } from './lair-experience-messages'
import type { MonsterLair } from './lair-schema'

export const MONSTER_LAIR_CUSTOM_XP_MESSAGE = 'Enter an in-lair XP amount.'
export const MONSTER_LAIR_SUGGESTED_UNAVAILABLE_MESSAGE =
  'A suggested XP value is unavailable for this CR. Choose Custom or remove in-lair XP.'
export type MonsterLairPublishBody = {
  challengeRating: ChallengeRating
  experiencePointsOverride?: number
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

function inLairXpMustExceedBase(
  inLairXp: number,
  baseXp: number,
  ctx: z.RefinementCtx,
  pathSuffix: (string | number)[],
  prefix: (string | number)[],
): void {
  if (inLairXp <= baseXp) {
    addCustomRefinementIssue(ctx, monsterLairInLairXpMustExceedBaseMessage(baseXp), [
      ...prefix,
      ...pathSuffix,
    ])
  }
}

export function refineMonsterLair(
  body: MonsterLairPublishBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const lair = body.lair
  if (!lair?.enabled || !lair.experience) return
  const baseXp = resolveMonsterBaseExperiencePoints(body)

  if (lair.experience.mode === 'custom' && lair.experience.value === undefined) {
    addCustomRefinementIssue(ctx, MONSTER_LAIR_CUSTOM_XP_MESSAGE, [
      ...prefix,
      'lair',
      'experience',
      'value',
    ])
    return
  }

  if (lair.experience.mode === 'custom' && lair.experience.value !== undefined) {
    inLairXpMustExceedBase(
      lair.experience.value,
      baseXp,
      ctx,
      ['lair', 'experience', 'value'],
      prefix,
    )
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
      return
    }
    inLairXpMustExceedBase(
      suggestion.experiencePoints,
      baseXp,
      ctx,
      ['lair', 'experience', 'mode'],
      prefix,
    )
  }
}

export function isMonsterLairExperienceActive(lair: MonsterLair | undefined): boolean {
  return lair?.enabled === true && lair.experience !== undefined
}
