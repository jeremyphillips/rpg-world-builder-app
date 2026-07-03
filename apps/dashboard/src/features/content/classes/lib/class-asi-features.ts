import type { ClassFeature } from '@rpg/contracts'

export const ABILITY_SCORE_IMPROVEMENT_FEAT_ID = 'ability-score-improvement'

export const ASI_FEATURE_NAME = 'Ability Score Improvement'

export const ASI_FEATURE_DESCRIPTION =
  '<p>You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.</p>'

/** Creates an ASI class feature using the atomic `grantGroups` model. */
export function createAsiFeature(level: number): ClassFeature {
  return {
    kind: 'custom',
    id: `ability-score-improvement-${level}`,
    name: ASI_FEATURE_NAME,
    level,
    description: ASI_FEATURE_DESCRIPTION,
    grantGroups: [
      {
        grants: [
          {
            kind: 'featChoice',
            category: 'general',
            choose: 1,
            allowAnyQualifying: true,
            recommendedFeatIds: [ABILITY_SCORE_IMPROVEMENT_FEAT_ID],
          },
        ],
      },
    ],
  }
}
