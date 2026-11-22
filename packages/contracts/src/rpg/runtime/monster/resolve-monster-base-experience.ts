import { CHALLENGE_RATING_MECHANICS, type ChallengeRating } from '../../vocab/challenge-rating'

export type MonsterBaseExperienceInput = {
  challengeRating: ChallengeRating
  experiencePointsOverride?: number
}

/** Normal XP reward for a monster — table XP unless `experiencePointsOverride` is set. */
export function resolveMonsterBaseExperiencePoints(input: MonsterBaseExperienceInput): number {
  const derived = CHALLENGE_RATING_MECHANICS[input.challengeRating].xp
  if (input.experiencePointsOverride !== undefined) {
    return input.experiencePointsOverride
  }
  return derived
}
