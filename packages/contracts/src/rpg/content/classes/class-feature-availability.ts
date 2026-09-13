/** Whether a class-body feature row is available in the campaign (omitted or true = available). */
export function isClassFeatureAvailable(feature: { available?: boolean }): boolean {
  return feature.available !== false
}

/** Filters class-body features to those available in the campaign. */
export function availableClassFeatures<T extends { available?: boolean }>(
  features: readonly T[],
): T[] {
  return features.filter(isClassFeatureAvailable)
}

/** Available class features unlocked at or below the given character level. */
export function classFeaturesUnlockedAtLevel<T extends { available?: boolean; level: number }>(
  features: readonly T[],
  characterLevel: number,
): T[] {
  return availableClassFeatures(features).filter((feature) => feature.level <= characterLevel)
}
