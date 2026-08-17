import type { CharacterClass } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type CharacterClassOverrides = Partial<CharacterClass>

const DEFAULT_CHARACTER_CLASS = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-class'),
  slug: 'test-class',
  name: 'Test Class',
  primaryAbilities: ['str'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'dex'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
} satisfies CharacterClass

export function makeCharacterClass(overrides: CharacterClassOverrides = {}): CharacterClass {
  const slug = overrides.slug ?? DEFAULT_CHARACTER_CLASS.slug

  return {
    ...DEFAULT_CHARACTER_CLASS,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? DEFAULT_CHARACTER_CLASS.name,
    ...overrides,
  }
}
