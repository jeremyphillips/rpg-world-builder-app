import {
  monsterRichTextIsEmpty,
  type ClassBodyFeature,
  type FacingBlock,
  type FacingResolution,
} from '@rpg/contracts'

import { type FeatureRowForm } from '../../../../classes/lib/class-feature-form-fields'

function blocksFromCustomRow(row: FeatureRowForm): FacingBlock[] {
  const blocks: FacingBlock[] = []
  const description = row.description?.trim()
  if (description && !monsterRichTextIsEmpty(description)) {
    blocks.push({ kind: 'richText', html: description })
  }
  for (const table of row.tables ?? []) {
    blocks.push({ kind: 'table', table })
  }
  return blocks
}

export function resolveCustomClassFeatureFacing(
  row: FeatureRowForm & { kind: 'custom' },
): FacingResolution {
  const title = String(row.name ?? '').trim()
  const blocks = blocksFromCustomRow(row)
  if (blocks.length === 0) {
    return { status: 'incomplete', reason: { code: 'missing-rules-text' } }
  }
  return { status: 'ready', document: { title, blocks } }
}

export function resolvePersistedCustomClassFeatureFacing(
  feature: Extract<ClassBodyFeature, { kind: 'custom' }>,
): FacingResolution {
  return resolveCustomClassFeatureFacing({
    id: feature.id,
    kind: 'custom',
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants: [],
    tables: feature.tables ?? [],
    available: 'available' in feature && feature.available === false ? false : true,
  })
}
