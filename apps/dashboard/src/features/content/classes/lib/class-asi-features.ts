import type { ClassFeature } from '@rpg/contracts'

export const ABILITY_SCORE_IMPROVEMENT_FEAT_ID = 'ability-score-improvement'

export const ASI_FEATURE_NAME = 'Ability Score Improvement'

export const ASI_FEATURE_DESCRIPTION =
  '<p>You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.</p>'

const ASI_FEATURE_ID_PATTERN = /^ability-score-improvement-\d+$/

/** Whether a feature row is an ASI milestone (managed by the ASI level picker). */
export function isAsiFeature(feature: Pick<ClassFeature, 'id' | 'name' | 'grants'>): boolean {
  if (ASI_FEATURE_ID_PATTERN.test(feature.id)) return true
  if (feature.name === ASI_FEATURE_NAME) return true
  return (
    feature.grants?.featChoice?.recommendedFeatIds?.includes(ABILITY_SCORE_IMPROVEMENT_FEAT_ID) ??
    false
  )
}

/** Derives ASI picker levels from persisted ASI feature rows. */
export function deriveAsiLevels(features: readonly ClassFeature[]): number[] {
  return features
    .filter(isAsiFeature)
    .map((feature) => feature.level)
    .sort((a, b) => a - b)
}

export function createAsiFeature(level: number): ClassFeature {
  return {
    kind: 'custom',
    id: `ability-score-improvement-${level}`,
    name: ASI_FEATURE_NAME,
    level,
    description: ASI_FEATURE_DESCRIPTION,
    grants: {
      featChoice: {
        category: 'general',
        choose: 1,
        allowAnyQualifying: true,
        recommendedFeatIds: [ABILITY_SCORE_IMPROVEMENT_FEAT_ID],
      },
    },
  }
}

/**
 * Replaces ASI feature rows with generated rows for `asiLevels` and preserves
 * all other features from the form.
 */
export function syncAsiFeatures(asiLevels: number[], features: ClassFeature[]): ClassFeature[] {
  const nonAsi = features.filter((feature) => !isAsiFeature(feature))
  const uniqueLevels = [...new Set(asiLevels)].sort((a, b) => a - b)
  const asiFeatures = uniqueLevels.map(createAsiFeature)
  return [...nonAsi, ...asiFeatures].sort(
    (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  )
}
