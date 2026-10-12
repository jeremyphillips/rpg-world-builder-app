import { describe, expect, it } from 'vitest'

import { equipmentSchema, isArmorEquipment, monsterSchema, type Monster } from '../../content'
import { skillProficiencySchema } from '../../content/skill-proficiency'
import { deriveCharacterProfile } from '../character/derive/profile'
import { resolveEquippedArmorFromInventory } from '../character/sheet/equipment-inventory'
import { toEquippedArmorPiece, resolveEquippedArmorClass } from '../creature/armor-class'
import { deriveMonsterDraftStatBlock, deriveMonsterStatBlock } from './stat-block'

const RULESET = 'srd-cc-5.2.1'

function weaponFromSeed(slug: string, extra: Record<string, unknown> = {}) {
  return equipmentSchema.parse({
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: slug,
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'weapon',
    category: 'simple',
    mode: 'melee',
    properties: ['finesse'],
    mastery: 'nick',
    damage: { dice: { count: 1, faces: 4 } },
    damageType: 'piercing',
    ...extra,
  })
}

const equipmentCatalog = new Map(
  [
    weaponFromSeed('dagger', {
      name: 'Dagger',
      properties: ['finesse', 'light', 'thrown'],
      range: { normal: 20, long: 60 },
    }),
    weaponFromSeed('shortsword', {
      name: 'Shortsword',
      properties: ['finesse', 'light'],
      damage: { dice: { count: 1, faces: 6 } },
    }),
    weaponFromSeed('shortbow', {
      name: 'Shortbow',
      mode: 'ranged',
      properties: ['ammunition', 'two-handed'],
      damage: { dice: { count: 1, faces: 6 } },
      range: { normal: 80, long: 320 },
    }),
    equipmentSchema.parse({
      id: `${RULESET}:chain-shirt`,
      slug: 'chain-shirt',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Chain Shirt',
      description: '',
      cost: { amount: 50, currency: 'gp' },
      weight: { value: 13, unit: 'lb' },
      kind: 'armor',
      category: 'medium',
      baseAc: 13,
      addDexModifier: true,
      maxDexBonus: 2,
      stealthDisadvantage: false,
    }),
  ].map((row) => [row.id, row]),
)

const skillCatalog = new Map([
  [
    'perception',
    skillProficiencySchema.parse({
      id: `${RULESET}:perception`,
      slug: 'perception',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Perception',
      ability: 'wis',
      examples: ['Hearing a nearby conversation'],
    }),
  ],
])

const kobold = monsterSchema.parse({
  id: `${RULESET}:kobold-warrior`,
  slug: 'kobold-warrior',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Kobold Warrior',
  description: '<p>Kobold</p>',
  size: 'small',
  creatureType: 'dragon',
  alignment: 'n',
  abilityScores: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
  armorClass: { kind: 'natural', bonus: 2 },
  hitPoints: { kind: 'hit-dice', count: 3 },
  movement: { walk: 30 },
  senses: [{ type: 'darkvision', range: 60 }],
  languages: { entries: [{ language: 'common' }, { language: 'draconic' }] },
  challengeRating: '1/8',
  proficiencies: {
    savingThrows: [],
    skills: [],
    weapons: { categories: [], items: [`${RULESET}:dagger`] },
  },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
  equipment: [{ entryId: 'dagger', equipmentId: `${RULESET}:dagger`, quantity: 1, equipped: true }],
  traits: [],
  actions: [{ id: 'dagger', kind: 'weapon', equipmentEntryId: 'dagger' }],
  bonusActions: [],
  reactions: [],
}) as Monster

const skeleton = monsterSchema.parse({
  id: `${RULESET}:skeleton`,
  slug: 'skeleton',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Skeleton',
  size: 'medium',
  creatureType: 'undead',
  alignment: 'le',
  abilityScores: { str: 10, dex: 16, con: 15, int: 6, wis: 8, cha: 5 },
  armorClass: { kind: 'natural', bonus: 1 },
  hitPoints: { kind: 'hit-dice', count: 2 },
  movement: { walk: 30 },
  senses: [{ type: 'darkvision', range: 60 }],
  languages: { entries: [{ language: 'common', speaks: false }] },
  challengeRating: '1/4',
  proficiencies: {
    savingThrows: [],
    skills: [],
    weapons: {
      categories: [],
      items: [`${RULESET}:shortbow`, `${RULESET}:shortsword`],
    },
  },
  defenses: {
    vulnerabilities: ['bludgeoning'],
    resistances: [],
    immunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
  },
  equipment: [
    { entryId: 'shortsword', equipmentId: `${RULESET}:shortsword`, quantity: 1, equipped: true },
    { entryId: 'shortbow', equipmentId: `${RULESET}:shortbow`, quantity: 1, equipped: true },
  ],
  traits: [],
  actions: [
    { id: 'shortsword', kind: 'weapon', equipmentEntryId: 'shortsword' },
    { id: 'shortbow', kind: 'weapon', equipmentEntryId: 'shortbow' },
  ],
  bonusActions: [],
  reactions: [],
}) as Monster

describe('deriveMonsterStatBlock', () => {
  it('derives Kobold Warrior stat lines', () => {
    const block = deriveMonsterStatBlock({ monster: kobold, equipmentCatalog, skillCatalog })
    expect(block.ac).toBe(14)
    expect(block.hp).toBe(7)
    expect(block.hpFormula).toBe('3d6 -3')
    expect(block.initiativeModifier).toBe(2)
    expect(block.proficiencyBonus).toBe(2)
    expect(block.experiencePoints).toBe(25)
    expect(block.passivePerception).toBe(8)
    const dagger = block.attacks.find((line) => line.id === 'dagger')
    expect(dagger?.attackBonus).toBe(4)
    expect(dagger?.damage).toBe('4')
    expect(dagger?.range).toEqual({ normal: 20, long: 60 })
  })

  it('derives Skeleton stat lines', () => {
    const block = deriveMonsterStatBlock({ monster: skeleton, equipmentCatalog, skillCatalog })
    expect(block.ac).toBe(14)
    expect(block.hp).toBe(13)
    expect(block.experiencePoints).toBe(50)
    expect(block.passivePerception).toBe(9)
    const shortsword = block.attacks.find((line) => line.id === 'shortsword')
    expect(shortsword?.attackBonus).toBe(5)
    expect(shortsword?.damage).toBe('6')
  })

  it('maps CR 0 XP default and override', () => {
    const cr0 = { ...kobold, challengeRating: '0' as const }
    expect(
      deriveMonsterStatBlock({ monster: cr0, equipmentCatalog, skillCatalog }).experiencePoints,
    ).toBe(10)
    expect(
      deriveMonsterStatBlock({
        monster: { ...cr0, experiencePointsOverride: 0 },
        equipmentCatalog,
        skillCatalog,
      }).experiencePoints,
    ).toBe(0)
  })

  it('applies natural-weapon proficiency without an entry', () => {
    const block = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [
          {
            id: 'claw',
            kind: 'natural-weapon',
            name: 'Claw',
            mode: 'melee',
            properties: ['finesse'],
            damage: { dice: { count: 1, faces: 4 } },
            damageType: 'slashing',
          },
        ],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(block.attacks[0]?.attackBonus).toBe(4)
  })
})

describe('modifiedArmorFixture parity', () => {
  const modifiedArmorFixture = {
    entryId: 'armor',
    equipmentId: `${RULESET}:chain-shirt`,
    quantity: 1,
    equipped: true,
    modifiers: [{ kind: 'armor_class' as const, bonus: -1 }],
  }

  it('matches character and monster equipment AC paths', () => {
    const dexScore = 16
    const monsterBlock = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        armorClass: { kind: 'equipment' },
        equipment: [modifiedArmorFixture],
        actions: [],
      },
      equipmentCatalog,
      skillCatalog,
    })

    const characterPieces = resolveEquippedArmorFromInventory({
      equipment: {
        weapons: [],
        armor: [modifiedArmorFixture],
        tools: [],
        gear: [],
        magicItems: [],
        vehicles: [],
        mounts: [],
      },
      catalog: equipmentCatalog,
    })
    const characterAc = deriveCharacterProfile({
      level: 1,
      proficiencies: { weapons: [], armor: [], tools: [], skills: [], languages: [] },
      skillProficiencies: [],
      abilityScores: { dex: dexScore },
      equippedArmor: characterPieces,
    }).ac

    expect(monsterBlock.ac).toBe(14)
    expect(monsterBlock.acBreakdown.bodyArmor).toMatchObject({
      base: 13,
      dex: 2,
      adjustment: -1,
    })
    expect(monsterBlock.acBreakdown.shields).toEqual([])
    expect(characterAc).toBe(14)
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 3,
        equippedArmor: [
          toEquippedArmorPiece(
            (() => {
              const item = equipmentCatalog.get(`${RULESET}:chain-shirt`)!
              if (!isArmorEquipment(item)) throw new Error('expected armor')
              return item
            })(),
            [{ kind: 'armor_class', bonus: -1 }],
          ),
        ],
      }),
    ).toBe(14)
  })

  it('counts a shield under natural armor as its own contribution', () => {
    const shield = equipmentSchema.parse({
      id: `${RULESET}:shield`,
      slug: 'shield',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Shield',
      description: '',
      cost: { amount: 10, currency: 'gp' },
      weight: { value: 6, unit: 'lb' },
      kind: 'armor',
      category: 'shields',
      material: 'metal',
      acBonus: 2,
      addDexModifier: false,
      stealthDisadvantage: false,
    })
    const catalog = new Map(equipmentCatalog)
    catalog.set(shield.id, shield)
    const block = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        equipment: [
          ...kobold.equipment,
          {
            entryId: 'shield',
            equipmentId: shield.id,
            quantity: 1,
            equipped: true,
            modifiers: [{ kind: 'armor_class', bonus: 1 }],
          },
        ],
      },
      equipmentCatalog: catalog,
      skillCatalog,
    })
    expect(block.ac).toBe(17)
    expect(block.acBreakdown.shields).toEqual([
      { entryId: 'shield', label: 'Shield', acBonus: 2, adjustment: 1 },
    ])
    expect(block.acBreakdown.bodyArmor).toBeUndefined()
  })
})

describe('deriveMonsterDraftStatBlock', () => {
  it('resolves available values and reports missing, reference, and conflict reasons', () => {
    const blankCr = deriveMonsterDraftStatBlock({
      monster: { ...kobold, challengeRating: undefined },
      equipmentCatalog,
      skillCatalog,
    })
    expect(blankCr.ac.status).toBe('resolved')
    expect(blankCr.hp.status).toBe('resolved')
    expect(blankCr.initiative.status).toBe('resolved')
    expect(blankCr.challenge).toEqual({ status: 'unavailable', reason: 'missing-input' })
    expect(blankCr.passivePerception).toEqual({ status: 'unavailable', reason: 'missing-input' })
    expect(blankCr.attacks[0]?.result).toEqual({ status: 'unavailable', reason: 'missing-input' })

    const missingArmor = deriveMonsterDraftStatBlock({
      monster: { ...kobold, armorClass: { kind: 'equipment' }, equipment: [] },
      equipmentCatalog,
      skillCatalog,
    })
    expect(missingArmor.ac).toEqual({ status: 'unavailable', reason: 'missing-reference' })

    const conflict = deriveMonsterDraftStatBlock({
      monster: {
        ...kobold,
        armorClass: { kind: 'equipment' },
        equipment: [
          {
            entryId: 'a',
            equipmentId: `${RULESET}:chain-shirt`,
            quantity: 1,
            equipped: true,
          },
          {
            entryId: 'b',
            equipmentId: `${RULESET}:chain-shirt`,
            quantity: 1,
            equipped: true,
          },
        ],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(conflict.ac).toEqual({ status: 'unavailable', reason: 'conflict' })
  })

  it('clamps a negative hit-dice average to 1 and keeps the formula', () => {
    const block = deriveMonsterDraftStatBlock({
      monster: {
        ...kobold,
        size: 'tiny',
        abilityScores: { ...kobold.abilityScores, con: 4 },
        hitPoints: { kind: 'hit-dice', count: 1 },
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(block.hp).toEqual({
      status: 'resolved',
      value: { hp: 1, formula: '1d4 -3', clampedToMinimum: true },
    })
  })

  it('throws from the strict wrapper when an invariant is broken', () => {
    expect(() =>
      deriveMonsterStatBlock({
        monster: { ...kobold, armorClass: { kind: 'equipment' }, equipment: [] },
        equipmentCatalog,
        skillCatalog,
      }),
    ).toThrow(/armorClass is unavailable/)
  })
})
