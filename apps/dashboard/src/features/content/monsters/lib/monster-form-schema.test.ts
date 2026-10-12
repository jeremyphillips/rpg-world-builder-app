import { describe, expect, it } from 'vitest'

import { resolveMonsterFormSchema } from './monster-form-schema'

const minimalMonsterBody = {
  name: 'Test',
  size: 'medium',
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  armorClass: { kind: 'unarmored' },
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: { walk: 30 },
  senses: [{ type: 'darkvision' }],
  languages: { entries: [] },
  challengeRating: '1',
  proficiencies: { savingThrows: [], skills: [], weapons: { categories: [], items: [] } },
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
}

describe('resolveMonsterFormSchema senses', () => {
  it('accepts senses without range for draft intent', () => {
    const result = resolveMonsterFormSchema({}, 'draft').safeParse(minimalMonsterBody)
    expect(result.success).toBe(true)
  })

  it('rejects senses without range for publish intent', () => {
    const result = resolveMonsterFormSchema({}, 'publish').safeParse(minimalMonsterBody)
    expect(result.success).toBe(false)
  })
})
