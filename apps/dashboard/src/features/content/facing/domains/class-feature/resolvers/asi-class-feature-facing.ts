import {
  monsterRichTextIsEmpty,
  type ClassBodyFeature,
  type FacingResolution,
} from '@rpg/contracts'

import { type FeatureRowForm } from '../../../../classes/lib/class-feature-form-fields'

export function resolveAsiClassFeatureFacing(
  row: FeatureRowForm & { id: string },
): FacingResolution {
  const title = String(row.name ?? '').trim()
  const description = row.description?.trim()
  const blocks =
    description && !monsterRichTextIsEmpty(description)
      ? [{ kind: 'richText' as const, html: description }]
      : []

  return { status: 'ready', document: { title, blocks } }
}

export function resolvePersistedAsiClassFeatureFacing(
  feature: Extract<ClassBodyFeature, { kind: 'asi' }>,
): FacingResolution {
  return resolveAsiClassFeatureFacing({
    id: feature.id,
    kind: 'asi',
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants: [],
    tables: [],
    available: 'available' in feature && feature.available === false ? false : true,
  })
}
