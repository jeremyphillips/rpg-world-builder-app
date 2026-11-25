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

export function resolveClassFeatureDraftFacing(
  row: FeatureRowForm & { kind: ClassFeatureKind },
  host: ClassFacingHostContext,
): FacingResolution {
  switch (row.kind) {
    case 'custom':
      return resolveCustomClassFeatureFacing(row as unknown as FeatureRowForm & { kind: 'custom' })
    case 'asi':
      return resolveAsiClassFeatureFacing(row as never)
    case 'spellcasting':
      return resolveSpellcastingClassFeatureFacing(
        row as FeatureRowForm & { kind: 'spellcasting' },
        host,
      )
    case 'subclass-choice':
      return resolveSubclassChoiceClassFeatureFacing(row as FeatureRowForm & { id: string }, host)
  }
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
  const unsupported: never = feature
  void unsupported
  return { status: 'invalid', reason: { code: 'unsupported-kind' } }
}
