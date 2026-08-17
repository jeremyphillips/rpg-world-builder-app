import type { Species } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

export type SpeciesOverrides = Partial<Species>

const DEFAULT_SPECIES = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-species'),
  slug: 'test-species',
  name: 'Test Species',
  description: '<p>Synthetic test species.</p>',
  creatureType: 'humanoid' as const,
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
} satisfies Species

export function makeSpecies(overrides: SpeciesOverrides = {}): Species {
  const slug = overrides.slug ?? DEFAULT_SPECIES.slug

  return {
    ...DEFAULT_SPECIES,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    name: overrides.name ?? DEFAULT_SPECIES.name,
    ...overrides,
  }
}
