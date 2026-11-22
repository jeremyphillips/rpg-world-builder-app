import { formatChallengeRating, type ChallengeRating } from '../../vocab/challenge-rating'
import { formatGroupedNumber } from '../../primitives/number-format'
import { formatExperiencePoints, formatProficiencyBonus } from '../creature/communication'

export type FormatCrStatRowInput = {
  challengeRating: ChallengeRating
  experiencePoints: number
  proficiencyBonus: number
  inLairExperiencePoints?: number
}

/** Stat-block Challenge Rating line, including optional in-lair XP clause. */
export function formatCrStatRow(input: FormatCrStatRowInput): string {
  const cr = formatChallengeRating(input.challengeRating)
  const reward = formatExperiencePoints(input.experiencePoints)
  const inLair =
    input.inLairExperiencePoints !== undefined
      ? `, or ${formatGroupedNumber(input.inLairExperiencePoints)} in lair`
      : ''
  const pb = formatProficiencyBonus(input.proficiencyBonus)
  return `${cr} (${reward}${inLair}; ${pb})`
}
