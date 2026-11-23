import type { GrantGroup } from '../lib/grants'
import { ABILITY_SCORE_IMPROVEMENT_FEAT_ID } from './class-asi-defaults'
import type { ClassBodyFeature, ClassFeature } from './class'

export const CLASS_ASI_FEAT_CHOICE_GRANT_ID = 'general-feat'

const DEFAULT_ASI_FEAT_CHOICE_GROUP: GrantGroup = {
  grants: [
    {
      id: CLASS_ASI_FEAT_CHOICE_GRANT_ID,
      kind: 'featChoice',
      category: 'general',
      choose: 1,
      allowAnyQualifying: true,
      recommendedFeatIds: [ABILITY_SCORE_IMPROVEMENT_FEAT_ID],
    },
  ],
}

/** Mechanical grant groups exposed to the character builder for a class feature row. */
export function resolveClassFeatureGrantGroups(
  feature: ClassFeature | ClassBodyFeature,
): readonly GrantGroup[] {
  switch (feature.kind) {
    case 'custom':
      return feature.grantGroups ?? []
    case 'asi':
      return [DEFAULT_ASI_FEAT_CHOICE_GROUP]
    case 'spellcasting':
    case 'subclass-choice':
      return []
    default: {
      const _exhaustive: never = feature
      return _exhaustive
    }
  }
}
