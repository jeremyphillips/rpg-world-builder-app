import {
  CHALLENGE_RATING_IDS,
  CHALLENGE_RATING_MECHANICS,
  compareChallengeRatings,
  type ChallengeRating,
  type ChallengeRatingMechanics,
} from '../../vocab/challenge-rating'

export type SuggestInLairExperienceResult =
  | { status: 'available'; experiencePoints: number }
  | { status: 'unavailable' }

const TABLE_ORDER: ChallengeRating[] = [...CHALLENGE_RATING_IDS].sort(compareChallengeRatings)

export function suggestInLairExperience(
  rating: ChallengeRating,
  mechanics: Record<ChallengeRating, ChallengeRatingMechanics> = CHALLENGE_RATING_MECHANICS,
): SuggestInLairExperienceResult {
  const index = TABLE_ORDER.indexOf(rating)
  if (index < 0 || index >= TABLE_ORDER.length - 1) {
    return { status: 'unavailable' }
  }
  const successor = TABLE_ORDER[index + 1]!
  return { status: 'available', experiencePoints: mechanics[successor].xp }
}
