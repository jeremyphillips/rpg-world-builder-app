import type { Subclass } from '@rpg/contracts'

import { syntheticContentMeta, syntheticContentId } from '../shared-content-meta'

const DEFAULT_SUBCLASS = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-subclass'),
  slug: 'test-subclass',
  name: 'Test Subclass',
  description: '<p>A synthetic subclass for tests.</p>',
  classId: syntheticContentId('test-class'),
  features: [],
} satisfies Subclass

export function makeSubclass(overrides: Partial<Subclass> = {}): Subclass {
  const slug = overrides.slug ?? DEFAULT_SUBCLASS.slug

  return {
    ...DEFAULT_SUBCLASS,
    ...overrides,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
  }
}
