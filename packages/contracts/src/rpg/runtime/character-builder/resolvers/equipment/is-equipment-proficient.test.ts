import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../../content/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import { isEquipmentProficient } from './is-equipment-proficient'

const thievesTools = {
  id: 'srd-cc-5.2.1:thieves-tools',
  slug: 'thieves-tools',
  rulesetId: 'srd-cc-5.2.1',
  name: "Thieves' Tools",
  kind: 'tool',
  toolCategory: 'thieves',
} as Extract<Equipment, { kind: 'tool' }>

const lute = {
  id: 'srd-cc-5.2.1:lute',
  slug: 'lute',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Lute',
  kind: 'tool',
  toolCategory: 'musical_instrument',
} as Extract<Equipment, { kind: 'tool' }>

const dagger = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Dagger',
  kind: 'weapon',
  category: 'simple',
} as Extract<Equipment, { kind: 'weapon' }>

const longsword = {
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Longsword',
  kind: 'weapon',
  category: 'martial',
} as Extract<Equipment, { kind: 'weapon' }>

const emptyProficiencies = {
  skills: [],
  weapons: [],
  armor: [],
  tools: [],
  languages: [],
} satisfies CharacterProficiencies

describe('isEquipmentProficient', () => {
  it('matches tool proficiency by slug', () => {
    expect(
      isEquipmentProficient(thievesTools, {
        ...emptyProficiencies,
        tools: [{ toolId: 'thieves-tools', rank: 'proficient', sources: [] }],
      }),
    ).toBe(true)
  })

  it('matches tool proficiency by category', () => {
    expect(
      isEquipmentProficient(lute, {
        ...emptyProficiencies,
        tools: [{ toolCategory: 'musical_instrument', rank: 'proficient', sources: [] }],
      }),
    ).toBe(true)
  })

  it('returns false when tool proficiency does not cover the row', () => {
    expect(
      isEquipmentProficient(lute, {
        ...emptyProficiencies,
        tools: [{ toolId: 'thieves-tools', rank: 'proficient', sources: [] }],
      }),
    ).toBe(false)
  })

  it('matches weapon proficiency by slug', () => {
    expect(
      isEquipmentProficient(dagger, {
        ...emptyProficiencies,
        weapons: [{ weaponId: 'dagger', rank: 'proficient', sources: [] }],
      }),
    ).toBe(true)
  })

  it('matches weapon proficiency by category', () => {
    expect(
      isEquipmentProficient(dagger, {
        ...emptyProficiencies,
        weapons: [{ weaponCategory: 'simple', rank: 'proficient', sources: [] }],
      }),
    ).toBe(true)
  })

  it('returns false when weapon proficiency does not cover the row', () => {
    expect(
      isEquipmentProficient(longsword, {
        ...emptyProficiencies,
        weapons: [{ weaponId: 'dagger', rank: 'proficient', sources: [] }],
      }),
    ).toBe(false)
  })
})
