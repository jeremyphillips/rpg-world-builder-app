import { compareCanonical, compareStrength, type OptionRecommendation } from '../../recommendation'

/**
 * Shared spell and proficiency browse order: recommendation strength, then name.
 * Selection and grant state are row chrome, not sort keys.
 */
export function compareRecommendationThenName(
  leftRecommendation: OptionRecommendation,
  rightRecommendation: OptionRecommendation,
  leftName: string,
  rightName: string,
): number {
  const strengthOrder = compareStrength(leftRecommendation, rightRecommendation)
  if (strengthOrder !== 0) return strengthOrder
  return compareCanonical(leftName, rightName)
}
