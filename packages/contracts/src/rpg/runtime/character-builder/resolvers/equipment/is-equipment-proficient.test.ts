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
})
