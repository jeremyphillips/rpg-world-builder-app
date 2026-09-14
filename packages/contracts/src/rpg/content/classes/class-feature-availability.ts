import { availableBodyRows, isBodyRowAvailable } from '../lib/campaign-access/body-row-availability'

/** Whether a class-body feature row is available in the campaign (omitted or true = available). */
export const isClassFeatureAvailable = isBodyRowAvailable

/** Filters class-body features to those available in the campaign. */
export const availableClassFeatures = availableBodyRows

/** Available class features unlocked at or below the given character level. */
export function classFeaturesUnlockedAtLevel<T extends { available?: boolean; level: number }>(
  features: readonly T[],
  characterLevel: number,
): T[] {
  return availableClassFeatures(features).filter((feature) => feature.level <= characterLevel)
}
