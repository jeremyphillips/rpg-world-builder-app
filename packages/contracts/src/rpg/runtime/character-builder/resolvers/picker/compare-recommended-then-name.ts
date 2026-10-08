import { compareCanonical } from '../../recommendation'

/**
 * Shared spell and proficiency browse order: recommended rows, then name.
 * Selection and grant state are row chrome, not sort keys.
 */
export function compareRecommendedThenName(
  leftRecommended: boolean,
  rightRecommended: boolean,
  leftName: string,
  rightName: string,
): number {
  if (leftRecommended !== rightRecommended) {
    return leftRecommended ? -1 : 1
  }
  return compareCanonical(leftName, rightName)
}
