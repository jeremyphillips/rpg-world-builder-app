import type { ClassBodyFeature, ClassFeatureKind, FacingResolution } from '@rpg/contracts'

import type { FeatureRowForm } from '../../../classes/lib/class-feature-form-fields'
import {
  resolveAsiClassFeatureFacing,
  resolvePersistedAsiClassFeatureFacing,
} from './resolvers/asi-class-feature-facing'
import {
  resolveCustomClassFeatureFacing,
  resolvePersistedCustomClassFeatureFacing,
} from './resolvers/custom-class-feature-facing'
import {
  resolvePersistedSpellcastingClassFeatureFacing,
  resolveSpellcastingClassFeatureFacing,
} from './resolvers/spellcasting-class-feature-facing'
import {
  resolvePersistedSubclassChoiceClassFeatureFacing,
  resolveSubclassChoiceClassFeatureFacing,
} from './resolvers/subclass-choice-class-feature-facing'
import type { ClassFacingHostContext } from './class-facing-host'

const CLASS_FEATURE_FACING_RESOLVERS = {
  custom: resolveCustomClassFeatureFacing,
  asi: resolveAsiClassFeatureFacing,
  spellcasting: resolveSpellcastingClassFeatureFacing,
  'subclass-choice': resolveSubclassChoiceClassFeatureFacing,
} as const satisfies Record<
  ClassFeatureKind,
  (row: FeatureRowForm & { id: string }, host: ClassFacingHostContext) => FacingResolution
>

export function resolveClassFeatureDraftFacing(
  row: FeatureRowForm & { id: string; kind: ClassFeatureKind },
  host: ClassFacingHostContext,
): FacingResolution {
  return CLASS_FEATURE_FACING_RESOLVERS[row.kind](row, host)
}

export function resolveClassFeaturePersistedFacing(
  feature: ClassBodyFeature,
  host: ClassFacingHostContext,
): FacingResolution {
  switch (feature.kind) {
    case 'custom':
      return resolvePersistedCustomClassFeatureFacing(feature)
    case 'asi':
      return resolvePersistedAsiClassFeatureFacing(feature)
    case 'spellcasting':
      return resolvePersistedSpellcastingClassFeatureFacing(feature, host)
    case 'subclass-choice':
      return resolvePersistedSubclassChoiceClassFeatureFacing(feature, host)
  }
}
