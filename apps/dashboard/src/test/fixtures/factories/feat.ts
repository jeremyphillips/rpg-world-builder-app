import type { Feat } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type FeatOverrides = Partial<Feat>

const DEFAULT_FEAT = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-feat'),
  slug: 'test-feat',
  name: 'Test Feat',
  description: '<p>Synthetic test feat.</p>',
  category: 'general',
  repeatable: { allowed: false },
} satisfies Feat

export function makeFeat(overrides: FeatOverrides = {}): Feat {
  const slug = overrides.slug ?? DEFAULT_FEAT.slug

  return {
    ...DEFAULT_FEAT,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? DEFAULT_FEAT.name,
    ...overrides,
  }
}
