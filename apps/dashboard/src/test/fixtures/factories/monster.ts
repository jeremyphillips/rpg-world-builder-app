import type { Monster } from '@rpg/contracts'

import { syntheticContentId, syntheticContentMeta } from './shared-content-meta'

const DEFAULT_MONSTER = {
  ...syntheticContentMeta,
  id: syntheticContentId('test-monster'),
  slug: 'test-monster',
  name: 'Test Monster',
  description: '<p>A synthetic monster for tests.</p>',
  size: 'medium',
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  armorClass: {},
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: { walk: 30 },
  senses: [],
  communication: {},
  challengeRating: '0',
  proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
  equipment: [],
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
} satisfies Monster

export function makeMonster(overrides: Partial<Monster> = {}): Monster {
  const slug = overrides.slug ?? DEFAULT_MONSTER.slug
  return {
    ...DEFAULT_MONSTER,
    id: overrides.id ?? syntheticContentId(slug),
    slug,
    ...overrides,
  }
}
