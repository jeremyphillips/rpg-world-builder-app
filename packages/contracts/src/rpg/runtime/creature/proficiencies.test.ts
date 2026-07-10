import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import {
  armorPoolChoiceOptions,
  isToolProficient,
  listArmorMatchingPool,
  listSkillsMatchingPool,
  listToolsMatchingPool,
  listWeaponsMatchingPool,
  skillPoolChoiceOptions,
  toolPoolChoiceOptions,
  weaponPoolChoiceOptions,
} from './proficiencies'

const athletics = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  name: 'Athletics',
} as SkillProficiency

const stealth = {
  id: 'srd-cc-5.2.1:stealth',
  slug: 'stealth',
  name: 'Stealth',
} as SkillProficiency

const skills = new Map([
  [athletics.id, athletics],
  [stealth.id, stealth],
])

const longsword = {
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  name: 'Longsword',
  kind: 'weapon',
  category: 'martial',
} as Equipment

const shortbow = {
  id: 'srd-cc-5.2.1:shortbow',
  slug: 'shortbow',
  name: 'Shortbow',
  kind: 'weapon',
  category: 'martial',
} as Equipment

const lute = {
  id: 'srd-cc-5.2.1:lute',
  slug: 'lute',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Lute',
  kind: 'tool',
  toolCategory: 'musical_instrument',
} as Extract<Equipment, { kind: 'tool' }>

const thievesTools = {
  id: 'srd-cc-5.2.1:thieves-tools',
  slug: 'thieves-tools',
  rulesetId: 'srd-cc-5.2.1',
  name: "Thieves' Tools",
  kind: 'tool',
  toolCategory: 'thieves',
} as Extract<Equipment, { kind: 'tool' }>

const leatherArmor = {
  id: 'srd-cc-5.2.1:leather-armor',
  slug: 'leather-armor',
  name: 'Leather Armor',
  kind: 'armor',
  category: 'light',
} as Equipment

const equipment = new Map([
  [longsword.id, longsword],
  [shortbow.id, shortbow],
  [lute.id, lute],
  [leatherArmor.id, leatherArmor],
])

describe('isToolProficient', () => {
  it('matches tool proficiency by content id', () => {
    expect(
      isToolProficient({
        equipment: lute,
        proficiencies: [{ toolId: lute.id }],
      }),
    ).toBe(true)
  })

  it('matches tool proficiency by slug', () => {
    expect(
      isToolProficient({
        equipment: thievesTools,
        proficiencies: [{ toolId: 'thieves-tools' }],
      }),
    ).toBe(true)
  })

  it('matches tool proficiency by category', () => {
    expect(
      isToolProficient({
        equipment: lute,
        proficiencies: [{ toolCategory: 'musical_instrument' }],
      }),
    ).toBe(true)
  })

  it('returns false when no proficiency covers the tool', () => {
    expect(
      isToolProficient({
        equipment: lute,
        proficiencies: [{ toolId: 'thieves-tools' }],
      }),
    ).toBe(false)
  })
})

describe('listSkillsMatchingPool', () => {
  it('expands explicit skill ids against the catalog', () => {
    expect(
      listSkillsMatchingPool({
        pool: { source: 'explicit', skillIds: ['athletics', 'missing'] },
        skills,
      }),
    ).toEqual([athletics])
  })

  it('expands any pools to all catalog skills', () => {
    expect(
      skillPoolChoiceOptions(
        listSkillsMatchingPool({
          pool: { source: 'any' },
          skills,
        }),
      ),
    ).toEqual([
      { id: athletics.id, label: 'Athletics' },
      { id: stealth.id, label: 'Stealth' },
    ])
  })
})

describe('listWeaponsMatchingPool', () => {
  it('expands filtered weapon pools by category', () => {
    expect(
      weaponPoolChoiceOptions(
        listWeaponsMatchingPool({
          pool: { source: 'filtered', weaponCategory: 'martial' },
          equipment,
          rulesetId: 'srd-cc-5.2.1',
        }),
      ),
    ).toEqual([
      { id: longsword.id, label: 'Longsword' },
      { id: shortbow.id, label: 'Shortbow' },
    ])
  })
})

describe('listToolsMatchingPool', () => {
  it('expands any tool pools to all catalog tools', () => {
    expect(
      toolPoolChoiceOptions(
        listToolsMatchingPool({
          pool: { source: 'any' },
          equipment,
          rulesetId: 'srd-cc-5.2.1',
        }),
      ),
    ).toEqual([{ id: lute.id, label: 'Lute' }])
  })
})

describe('listArmorMatchingPool', () => {
  it('expands filtered armor pools by category', () => {
    expect(
      armorPoolChoiceOptions(
        listArmorMatchingPool({
          pool: { source: 'filtered', armorCategory: 'light' },
          equipment,
          rulesetId: 'srd-cc-5.2.1',
        }),
      ),
    ).toEqual([{ id: leatherArmor.id, label: 'Leather Armor' }])
  })
})
