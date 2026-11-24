import {
  resolveClassFeatureName,
  type ClassBodyFeature,
  type FacingResolution,
} from '@rpg/contracts'

import { type FeatureRowForm } from '../../../../classes/lib/class-feature-form-fields'
import type { ClassFacingHostContext } from '../class-facing-host'

export function resolveSubclassChoiceClassFeatureFacing(
  row: FeatureRowForm & { id: string },
  host: ClassFacingHostContext,
): FacingResolution {
  const title = resolveClassFeatureName(
    { kind: 'subclass-choice', name: row.name?.trim() || undefined },
    host.className,
  )
  return { status: 'ready', document: { title, blocks: [] } }
}

export function resolvePersistedSubclassChoiceClassFeatureFacing(
  feature: Extract<ClassBodyFeature, { kind: 'subclass-choice' }>,
  host: ClassFacingHostContext,
): FacingResolution {
  return resolveSubclassChoiceClassFeatureFacing(
    {
      id: feature.id,
      kind: 'subclass-choice',
      name: feature.name ?? '',
      level: feature.level,
      grants: [],
      tables: [],
      available: 'available' in feature && feature.available === false ? false : true,
    },
    host,
  )
}
