import type { Spell } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type SpellOverrides = Partial<Spell>

const DEFAULT_SPELL = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-spell'),
  slug: 'test-spell',
  name: 'Test Spell',
  description: '<p>Synthetic test spell.</p>',
  school: 'evocation' as const,
  level: 0,
  classIds: ['test-class'],
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
  duration: { kind: 'instantaneous' },
  components: { verbal: true, somatic: true },
} satisfies Spell

export function makeSpell(overrides: SpellOverrides = {}): Spell {
  const slug = overrides.slug ?? DEFAULT_SPELL.slug

  return {
    ...DEFAULT_SPELL,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? DEFAULT_SPELL.name,
    ...overrides,
  }
}
