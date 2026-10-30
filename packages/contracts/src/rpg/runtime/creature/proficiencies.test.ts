import { describe, expect, it } from 'vitest'

import type { CreatureWeaponProficiencies } from '../../content/creature'
import type { Equipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import { equipmentSchema } from '../../content/equipment'
import {
  armorPoolChoiceOptions,
  creatureWeaponProficiencyGrantSetFromTargets,
  creatureWeaponProficiencyTargetsFromGrantSet,
  isToolProficient,
  isWeaponProficient,
  isWeaponProficientFromGrantSet,
  listArmorMatchingPool,
  resolveMonsterArmorProficiencyCategories,
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

  it('expands filtered pools across multiple categories with deduplication', () => {
    const drum = {
      id: 'srd-cc-5.2.1:drum',
      slug: 'drum',
      rulesetId: 'srd-cc-5.2.1',
      name: 'Drum',
      kind: 'tool',
      toolCategory: 'musical_instrument',
    } as Extract<Equipment, { kind: 'tool' }>

    const expandedEquipment = new Map([
      ...equipment.entries(),
      [drum.id, drum],
      [
        thievesTools.id,
        {
          ...thievesTools,
          toolCategory: 'thieves',
        },
      ],
    ])

    expect(
      toolPoolChoiceOptions(
        listToolsMatchingPool({
          pool: {
            source: 'filtered',
            toolCategories: ['musical_instrument', 'thieves'],
            toolSlugs: ['lute'],
          },
          equipment: expandedEquipment,
          rulesetId: 'srd-cc-5.2.1',
        }),
      ),
    ).toEqual([
      { id: drum.id, label: 'Drum' },
      { id: lute.id, label: 'Lute' },
      { id: thievesTools.id, label: "Thieves' Tools" },
    ])
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

describe('creature weapon proficiency grant set helpers', () => {
  const dagger = equipmentSchema.parse({
    id: 'srd-cc-5.2.1:dagger',
    slug: 'dagger',
    rulesetId: 'srd-cc-5.2.1',
    catalogLayer: 'system',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Dagger',
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'weapon',
    category: 'simple',
    mode: 'melee',
    properties: ['finesse', 'light'],
    mastery: 'nick',
    damage: { dice: { count: 1, faces: 4 } },
    damageType: 'piercing',
  }) as Extract<Equipment, { kind: 'weapon' }>

  it('expands grant sets to sorted category rows then sorted item rows', () => {
    expect(
      creatureWeaponProficiencyTargetsFromGrantSet({
        categories: ['martial', 'simple'],
        items: ['srd-cc-5.2.1:shortbow', 'srd-cc-5.2.1:dagger'],
      }),
    ).toEqual([
      { weaponCategory: 'martial' },
      { weaponCategory: 'simple' },
      { weaponId: 'srd-cc-5.2.1:dagger' },
      { weaponId: 'srd-cc-5.2.1:shortbow' },
    ])
  })

  it('folds target rows into a deduped sorted grant set', () => {
    expect(
      creatureWeaponProficiencyGrantSetFromTargets([
        { weaponId: 'srd-cc-5.2.1:shortbow' },
        { weaponCategory: 'simple' },
        { weaponId: 'srd-cc-5.2.1:dagger' },
        { weaponCategory: 'simple' },
      ]),
    ).toEqual({
      categories: ['simple'],
      items: ['srd-cc-5.2.1:dagger', 'srd-cc-5.2.1:shortbow'],
    })
  })

  it('matches weapons from grant sets and target rows consistently', () => {
    const grant: CreatureWeaponProficiencies = {
      categories: ['simple'],
      items: ['srd-cc-5.2.1:dagger'],
    }
    expect(isWeaponProficientFromGrantSet(dagger, grant)).toBe(true)
    expect(isWeaponProficient(dagger, creatureWeaponProficiencyTargetsFromGrantSet(grant))).toBe(
      true,
    )
    expect(isWeaponProficientFromGrantSet(dagger, { categories: ['martial'], items: [] })).toBe(
      false,
    )
  })
})

describe('resolveMonsterArmorProficiencyCategories', () => {
  it('includes owned body armor and shields whether or not they are equipped', () => {
    const shield = {
      id: 'srd-cc-5.2.1:shield',
      kind: 'armor',
      category: 'shields',
    } as Equipment
    const catalog = new Map<string, Equipment>([
      [leatherArmor.id, leatherArmor],
      [shield.id, shield],
      [longsword.id, longsword],
    ])
    expect(
      resolveMonsterArmorProficiencyCategories(
        [
          { equipmentId: leatherArmor.id },
          { equipmentId: shield.id },
          { equipmentId: longsword.id },
        ],
        catalog,
      ),
    ).toEqual(['light', 'shields'])
  })
})
