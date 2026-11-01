import { describe, expect, it } from 'vitest'

import {
  equipmentSchema,
  isArmorEquipment,
  isWeaponEquipment,
  monsterSchema,
  type Equipment,
  type Monster,
} from '../../content'
import { skillProficiencySchema } from '../../content/skill-proficiency'
import { deriveCharacterProfile } from '../character/derive/profile'
import { resolveEquippedArmorFromInventory } from '../character/sheet/equipment-inventory'
import { resolveCreatureArmorClass, toEquippedArmorPiece } from '../creature/armor-class'
import { isWeaponProficient } from '../creature/proficiencies'
import { resolveWeaponAttackAbilityModifier } from '../creature/weapon-attack'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { normalizeEquipmentInstance } from '../../content/equipment/instance/normalize-equipment-instance'
import { resolveInventoryWeaponAttackTotals } from '../creature/resolve-inventory-weapon-attack'
import { systemDefaultArmorClassRules } from '../../campaign/patches/campaign-mechanics-patch'
import { ARMOR_CLASS_RULES_MATRIX } from '../../vocab/mechanics/armor-class-scale'
import { resolveMonsterActionAttackProfile } from './resolve-monster-action-attack-profile'
import {
  deriveMonsterDraftStatBlock as deriveMonsterDraftStatBlockRaw,
  deriveMonsterStatBlock as deriveMonsterStatBlockRaw,
  resolveMonsterHitPoints,
} from './stat-block'

const EMPTY_MAGIC_PROVIDER: MagicPropertyDefinitionProvider = () => undefined

function deriveMonsterStatBlock(
  input: Omit<
    Parameters<typeof deriveMonsterStatBlockRaw>[0],
    'armorClassRules' | 'magicPropertyProvider'
  > &
    Partial<
      Pick<
        Parameters<typeof deriveMonsterStatBlockRaw>[0],
        'armorClassRules' | 'magicPropertyProvider'
      >
    >,
) {
  return deriveMonsterStatBlockRaw({
    armorClassRules: systemDefaultArmorClassRules(),
    magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    ...input,
  })
}

function publishedArmor(block: ReturnType<typeof deriveMonsterStatBlock>) {
  if (block.ac.status !== 'resolved') {
    throw new Error(`expected resolved armor class, received ${block.ac.reason}`)
  }
  return block.ac.value
}

function deriveMonsterDraftStatBlock(
  input: Omit<
    Parameters<typeof deriveMonsterDraftStatBlockRaw>[0],
    'armorClassRules' | 'magicPropertyProvider'
  > &
    Partial<
      Pick<
        Parameters<typeof deriveMonsterDraftStatBlockRaw>[0],
        'armorClassRules' | 'magicPropertyProvider'
      >
    >,
) {
  return deriveMonsterDraftStatBlockRaw({
    armorClassRules: systemDefaultArmorClassRules(),
    magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    ...input,
  })
}

const RULESET = 'srd-cc-5.2.1'

function weaponFromSeed(
  slug: string,
  extra: Record<string, unknown> = {},
): Extract<Equipment, { kind: 'weapon' }> {
  const row = equipmentSchema.parse({
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    catalogLayer: 'system',
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
  if (!isWeaponEquipment(row)) throw new Error('expected weapon seed')
  return row
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
      catalogLayer: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Chain Shirt',
      description: '',
      cost: { amount: 50, currency: 'gp' },
      weight: { value: 13, unit: 'lb' },
      kind: 'armor',
      category: 'medium',
      baseAcOffset: 3,
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
      catalogLayer: 'system',
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
  catalogLayer: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Kobold Warrior',
  description: '<p>Kobold</p>',
  sizes: ['small'],
  creatureType: 'dragon',
  alignment: 'n',
  abilityScores: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
  armorClass: { naturalArmorBonus: 2 },
  hitPoints: { kind: 'hit-dice', count: 3 },
  movement: { walk: 30 },
  senses: [{ type: 'darkvision', range: 60 }],
  communication: {},
  challengeRating: '1/8',
  proficiencies: {
    savingThrows: [],
    skills: [],
    languages: [{ language: 'common' }, { language: 'draconic' }],
    weapons: [{ weaponId: `${RULESET}:dagger` }],
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
  catalogLayer: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Skeleton',
  sizes: ['medium'],
  creatureType: 'undead',
  alignment: 'le',
  abilityScores: { str: 10, dex: 16, con: 15, int: 6, wis: 8, cha: 5 },
  armorClass: { naturalArmorBonus: 1 },
  hitPoints: { kind: 'hit-dice', count: 2 },
  movement: { walk: 30 },
  senses: [{ type: 'darkvision', range: 60 }],
  communication: {},
  challengeRating: '1/4',
  proficiencies: {
    savingThrows: [],
    skills: [],
    languages: [{ language: 'common', speaks: false }],
    weapons: [{ weaponId: `${RULESET}:shortbow` }, { weaponId: `${RULESET}:shortsword` }],
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
    expect(publishedArmor(block).ac).toBe(14)
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
    expect(block.senses).toEqual([{ type: 'darkvision', range: 60 }])
  })

  it('keeps the greater sense range when a trait grants the same sense', () => {
    const block = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        traits: [
          {
            kind: 'custom',
            id: 'keen',
            name: 'Keen Senses',
            description: '<p>Sees farther.</p>',
            grantGroups: [
              { grants: [{ id: 'sense-1', kind: 'sense', type: 'darkvision', range: 120 }] },
            ],
          },
        ],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(block.senses).toEqual([{ type: 'darkvision', range: 120 }])
  })

  it('derives Skeleton stat lines', () => {
    const block = deriveMonsterStatBlock({ monster: skeleton, equipmentCatalog, skillCatalog })
    expect(publishedArmor(block).ac).toBe(14)
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
    const normalizedArmor = normalizeEquipmentInstance(modifiedArmorFixture)

    for (const armorEntry of [modifiedArmorFixture, normalizedArmor]) {
      const monsterBlock = deriveMonsterStatBlock({
        monster: {
          ...kobold,
          armorClass: {},
          equipment: [armorEntry],
          actions: [],
        },
        equipmentCatalog,
        skillCatalog,
      })

      const characterPieces = resolveEquippedArmorFromInventory({
        equipment: {
          weapons: [],
          armor: [armorEntry],
          tools: [],
          gear: [],
          magicItems: [],
          vehicles: [],
          mounts: [],
        },
        catalog: equipmentCatalog,
      })
      const characterAc = deriveCharacterProfile({
        armorClassRules: systemDefaultArmorClassRules(),
        level: 1,
        proficiencies: { weapons: [], armor: [], tools: [], skills: [], languages: [] },
        skillProficiencies: [],
        abilityScores: { dex: dexScore },
        equippedArmor: characterPieces.pieces,
      }).ac

      expect(publishedArmor(monsterBlock).ac).toBe(14)
      expect(characterAc).toEqual({ status: 'resolved', value: 14 })
    }

    for (const rules of ARMOR_CLASS_RULES_MATRIX) {
      const monsterBlock = deriveMonsterStatBlock({
        armorClassRules: rules,
        monster: {
          ...kobold,
          armorClass: {},
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
        armorClassRules: rules,
        level: 1,
        proficiencies: { weapons: [], armor: [], tools: [], skills: [], languages: [] },
        skillProficiencies: [],
        abilityScores: { dex: dexScore },
        equippedArmor: characterPieces.pieces,
      }).ac

      expect(characterAc).toEqual({ status: 'resolved', value: publishedArmor(monsterBlock).ac })
    }

    const monsterBlock = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        armorClass: {},
        equipment: [modifiedArmorFixture],
        actions: [],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(publishedArmor(monsterBlock).source).toBe('armor')
    expect(publishedArmor(monsterBlock).rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'armor-base', value: 13 }),
        expect.objectContaining({ kind: 'dex', value: 2, cap: 2 }),
        expect.objectContaining({ kind: 'enhancement', target: 'armor', value: -1 }),
      ]),
    )
    expect(publishedArmor(monsterBlock).shield).toBeUndefined()
    expect(
      resolveCreatureArmorClass({
        rules: systemDefaultArmorClassRules(),
        dexModifier: 3,
        shields: [],
        bodyArmor: toEquippedArmorPiece(
          (() => {
            const item = equipmentCatalog.get(`${RULESET}:chain-shirt`)!
            if (!isArmorEquipment(item)) throw new Error('expected armor')
            return item
          })(),
          [{ kind: 'armor_class', bonus: -1 }],
        ),
        eligibility: { skinCompetesWithArmor: false },
      }).ac,
    ).toBe(14)
  })

  it('uses worn armor when it beats natural armor, including the armor enhancement', () => {
    const armorEnhancementProvider: MagicPropertyDefinitionProvider = (id) =>
      id === `${RULESET}:armor-enhancement-1`
        ? {
            id,
            name: 'Armor +1',
            description: 'test',
            category: 'enhancement',
            appliesTo: ['armor'],
            effects: [{ target: 'armor_class', bonus: 1 }],
          }
        : undefined

    const bodyArmorEntry = {
      entryId: 'chain',
      equipmentId: `${RULESET}:chain-shirt`,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset' as const, propertyId: `${RULESET}:armor-enhancement-1` }],
    }

    const withoutBody = deriveMonsterStatBlock({
      monster: { ...kobold, equipment: [], actions: [] },
      equipmentCatalog,
      skillCatalog,
    })
    const withBody = deriveMonsterStatBlock({
      monster: { ...kobold, equipment: [bodyArmorEntry], actions: [] },
      equipmentCatalog,
      skillCatalog,
      magicPropertyProvider: armorEnhancementProvider,
    })

    expect(publishedArmor(withoutBody).ac).toBe(14)
    expect(publishedArmor(withBody).ac).toBe(16)
    expect(publishedArmor(withBody).source).toBe('armor')
    expect(publishedArmor(withBody).rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'enhancement', target: 'armor', value: 1 }),
      ]),
    )
  })

  it('counts a shield under natural armor as its own contribution', () => {
    const shield = equipmentSchema.parse({
      id: `${RULESET}:shield`,
      slug: 'shield',
      rulesetId: RULESET,
      catalogLayer: 'system',
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
    expect(publishedArmor(block).ac).toBe(17)
    expect(publishedArmor(block).source).toBe('natural')
    expect(publishedArmor(block).shield).toEqual({ entryId: 'shield', label: 'Shield' })
    expect(publishedArmor(block).rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'shield', value: 2 }),
        expect.objectContaining({ kind: 'enhancement', target: 'shield', value: 1 }),
      ]),
    )
    expect(publishedArmor(block).bodyArmor).toBeUndefined()
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

    const missingDex = deriveMonsterDraftStatBlock({
      monster: {
        ...kobold,
        abilityScores: { ...kobold.abilityScores, dex: undefined as unknown as number },
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(missingDex.ac).toEqual({ status: 'unavailable', reason: 'missing-input' })

    const conflict = deriveMonsterDraftStatBlock({
      monster: {
        ...kobold,
        armorClass: {},
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
        sizes: ['tiny'],
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

  it('keeps the rest of the block when armor class is unavailable', () => {
    const conflict = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [],
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
    expect(conflict.hp).toBe(7)
    expect(conflict.proficiencyBonus).toBe(2)

    const missing = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [],
        equipment: [
          {
            entryId: 'gone',
            equipmentId: `${RULESET}:missing-armor`,
            quantity: 1,
            equipped: true,
          },
        ],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(missing.ac).toEqual({ status: 'unavailable', reason: 'missing-reference' })
    expect(missing.hp).toBe(7)
    expect(missing.initiativeModifier).toBe(2)
  })

  it('throws when hit points are unavailable', () => {
    expect(() =>
      deriveMonsterStatBlock({
        monster: { ...kobold, hitPoints: undefined, actions: [] } as unknown as Monster,
        equipmentCatalog,
        skillCatalog,
      }),
    ).toThrow(/hitPoints is unavailable/)
  })
})

describe('equipment magic property derivation parity', () => {
  const provider: MagicPropertyDefinitionProvider = (id) =>
    id === 'srd-cc-5.2.1:weapon-enhancement-1'
      ? {
          id,
          name: 'Enhancement +1',
          description: 'test',
          category: 'enhancement',
          appliesTo: ['weapon'],
          effects: [
            { target: 'attack_roll', bonus: 1 },
            { target: 'damage_roll', bonus: 1 },
          ],
        }
      : undefined
  const longswordId = `${RULESET}:longsword`
  const longsword = weaponFromSeed('longsword', {
    name: 'Longsword',
    category: 'martial',
    properties: ['finesse'],
    mastery: 'nick',
    damage: { dice: { count: 1, faces: 8 } },
    damageType: 'slashing',
  })
  const catalog = new Map(equipmentCatalog)
  catalog.set(longswordId, longsword)

  const entry = {
    entryId: 'sword',
    equipmentId: longswordId,
    quantity: 1,
    equipped: true,
    magical: true,
    magicProperties: [{ kind: 'preset' as const, propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
    adjustments: [{ effectId: 'manual', target: 'attack_roll' as const, bonus: 1 }],
  }

  it('matches monster and character weapon totals for enhancement plus manual attack', () => {
    const monster = {
      ...kobold,
      actions: [{ id: 'slash', kind: 'weapon' as const, equipmentEntryId: 'sword' }],
      equipment: [entry],
    }
    const monsterAttack = deriveMonsterStatBlock({
      monster,
      equipmentCatalog: catalog,
      skillCatalog,
      magicPropertyProvider: provider,
    }).attacks[0]

    const abilityMod = resolveWeaponAttackAbilityModifier(longsword, monster.abilityScores)!
    const characterTotals = resolveInventoryWeaponAttackTotals({
      entry,
      item: longsword,
      abilityModifier: abilityMod,
      proficient: isWeaponProficient(longsword, monster.proficiencies.weapons),
      proficiencyBonus: 2,
      provider,
    })

    expect(characterTotals?.attackBonus).toBe(monsterAttack?.attackBonus)
    expect(characterTotals?.damageAverage).toBe(Number(monsterAttack?.damage))
  })
})

describe('equipment effect derivation (ship P0)', () => {
  const provider: MagicPropertyDefinitionProvider = (id) =>
    id === `${RULESET}:weapon-enhancement-1`
      ? {
          id,
          name: 'Enhancement +1',
          description: 'test',
          category: 'enhancement',
          appliesTo: ['weapon'],
          effects: [
            { target: 'attack_roll', bonus: 1 },
            { target: 'damage_roll', bonus: 1 },
          ],
        }
      : undefined

  it('does not multiply weapon bonuses by stack quantity', () => {
    const daggerId = `${RULESET}:dagger`
    const entryBase = {
      entryId: 'sword',
      equipmentId: daggerId,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset' as const, propertyId: `${RULESET}:weapon-enhancement-1` }],
    }
    const qtyOne = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [{ id: 'slash', kind: 'weapon' as const, equipmentEntryId: 'sword' }],
        equipment: [{ ...entryBase, quantity: 1 }],
      },
      equipmentCatalog,
      skillCatalog,
      magicPropertyProvider: provider,
    }).attacks[0]?.attackBonus

    const qtyTwo = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [{ id: 'slash', kind: 'weapon' as const, equipmentEntryId: 'sword' }],
        equipment: [{ ...entryBase, quantity: 2 }],
      },
      equipmentCatalog,
      skillCatalog,
      magicPropertyProvider: provider,
    }).attacks[0]?.attackBonus

    expect(qtyTwo).toBe(qtyOne)
  })

  it('applies enhancement only to the action that references the equipment entry', () => {
    const daggerId = `${RULESET}:dagger`
    const enhanced = {
      entryId: 'plus-one',
      equipmentId: daggerId,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset' as const, propertyId: `${RULESET}:weapon-enhancement-1` }],
    }
    const plain = {
      entryId: 'plain',
      equipmentId: daggerId,
      quantity: 1,
      equipped: true,
    }
    const block = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        actions: [
          {
            id: 'enhanced',
            name: 'Enhanced',
            kind: 'weapon' as const,
            equipmentEntryId: 'plus-one',
          },
          { id: 'plain', name: 'Plain', kind: 'weapon' as const, equipmentEntryId: 'plain' },
        ],
        equipment: [enhanced, plain],
      },
      equipmentCatalog,
      skillCatalog,
      magicPropertyProvider: provider,
    })
    const enhancedAttack = block.attacks.find((row) => row.name === 'Enhanced')
    const plainAttack = block.attacks.find((row) => row.name === 'Plain')
    expect(enhancedAttack!.attackBonus! > plainAttack!.attackBonus!).toBe(true)
  })

  it('keeps derived AC unchanged when normalizing legacy armor_class modifiers', () => {
    const fixture = {
      entryId: 'armor',
      equipmentId: `${RULESET}:chain-shirt`,
      quantity: 1,
      equipped: true,
      modifiers: [{ kind: 'armor_class' as const, bonus: -1 }],
    }
    const normalized = normalizeEquipmentInstance(fixture)
    const legacyBlock = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        armorClass: {},
        equipment: [fixture],
        actions: [],
      },
      equipmentCatalog,
      skillCatalog,
    })
    const normalizedBlock = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        armorClass: {},
        equipment: [normalized],
        actions: [],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(publishedArmor(normalizedBlock).ac).toBe(publishedArmor(legacyBlock).ac)
  })

  it('ignores equipment AC effects under fixed monster armor class', () => {
    const fixture = {
      entryId: 'armor',
      equipmentId: `${RULESET}:chain-shirt`,
      quantity: 1,
      equipped: true,
      adjustments: [{ effectId: 'ac', target: 'armor_class' as const, bonus: 5 }],
    }
    const block = deriveMonsterStatBlock({
      monster: {
        ...kobold,
        armorClass: { naturalArmorBonus: 2, fixedAcOffset: 7 },
        equipment: [fixture],
        actions: [],
      },
      equipmentCatalog,
      skillCatalog,
    })
    expect(publishedArmor(block).ac).toBe(17)
  })
})

describe('monster spellcasting lines', () => {
  it('resolves save DC and attack bonus through a shared ability', () => {
    const monster = monsterSchema.parse({
      ...kobold,
      actions: [
        ...kobold.actions,
        {
          id: 'spellcasting',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [{ spellId: `${RULESET}:mage-hand` }],
        },
      ],
      reactions: [
        {
          id: 'protective-magic',
          kind: 'spell',
          name: 'Protective Magic',
          castingAbility: { kind: 'shared', entryId: 'spellcasting' },
          spells: [{ spellId: `${RULESET}:shield` }],
        },
      ],
    }) as Monster
    const derived = deriveMonsterStatBlock({ monster, equipmentCatalog, skillCatalog })
    expect(derived.spellcasting).toEqual([
      { id: 'spellcasting', section: 'actions', saveDc: 9, attackBonus: 1 },
      { id: 'protective-magic', section: 'reactions', saveDc: 9, attackBonus: 1 },
    ])
  })
})

describe('resolveMonsterHitPoints size', () => {
  const scores = { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }

  it('uses the largest permitted size regardless of array order', () => {
    const forward = resolveMonsterHitPoints({
      sizes: ['small', 'medium'],
      abilityScores: scores,
      hitPoints: { kind: 'hit-dice', count: 8 },
    })
    const reversed = resolveMonsterHitPoints({
      sizes: ['medium', 'small'],
      abilityScores: scores,
      hitPoints: { kind: 'hit-dice', count: 8 },
    })
    expect(forward.status).toBe('resolved')
    expect(reversed.status).toBe('resolved')
    if (forward.status !== 'resolved' || reversed.status !== 'resolved') return
    expect(forward.value.formula).toBe('8d8 +16')
    expect(reversed.value.formula).toBe('8d8 +16')
  })

  it('keeps a single-size die and leaves an empty size list unavailable', () => {
    const small = resolveMonsterHitPoints({
      sizes: ['small'],
      abilityScores: scores,
      hitPoints: { kind: 'hit-dice', count: 3 },
    })
    expect(small.status).toBe('resolved')
    if (small.status === 'resolved') expect(small.value.formula).toBe('3d6 +6')
    expect(
      resolveMonsterHitPoints({
        sizes: [],
        abilityScores: scores,
        hitPoints: { kind: 'hit-dice', count: 3 },
      }).status,
    ).toBe('unavailable')
  })
})

describe('resolveMonsterActionAttackProfile', () => {
  it('matches the published dagger line and keeps thrown range without a second attack', () => {
    const block = deriveMonsterStatBlock({ monster: kobold, equipmentCatalog, skillCatalog })
    const line = block.attacks.find((attack) => attack.id === 'dagger')
    const profile = resolveMonsterActionAttackProfile({
      action: kobold.actions[0]!,
      monster: kobold,
      equipmentCatalog,
      proficiencyBonus: block.proficiencyBonus,
      magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    })
    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(profile.value.attackBonus).toBe(line?.attackBonus)
    expect(String(profile.value.primary.average)).toBe(line?.damage)
    expect(profile.value.primary.expression).toBe(line?.damageExpression)
    expect(profile.value.range).toEqual(line?.range)
    expect(profile.value.reach).toBe(5)
    expect(profile.value.modes).toEqual(['melee'])
    expect(profile.value.sourceLabel).toBe('Dagger')
    expect(profile.value.unresolvedCapabilities.map((entry) => entry.id)).toEqual(['thrown'])
    expect(profile.value.unresolvedCapabilities[0]?.reason).toBe('missing-input')
  })

  it('does not apply versatile damage and does not invent dice when damage is missing', () => {
    const versatile = weaponFromSeed('longsword-versatile', {
      name: 'Longsword',
      properties: ['versatile'],
      damage: { dice: { count: 1, faces: 8 } },
      versatileDamage: { count: 1, faces: 10 },
      damageType: 'slashing',
    })
    const catalog = new Map(equipmentCatalog)
    catalog.set(versatile.id, versatile)
    const monster = {
      ...kobold,
      equipment: [{ entryId: 'sword', equipmentId: versatile.id, quantity: 1, equipped: true }],
      actions: [{ id: 'slash', kind: 'weapon' as const, equipmentEntryId: 'sword' }],
      proficiencies: {
        ...kobold.proficiencies,
        weapons: [{ weaponId: versatile.id }],
      },
    }
    const block = deriveMonsterStatBlock({ monster, equipmentCatalog: catalog, skillCatalog })
    const profile = resolveMonsterActionAttackProfile({
      action: monster.actions[0]!,
      monster,
      equipmentCatalog: catalog,
      proficiencyBonus: block.proficiencyBonus,
      magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    })
    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(String(profile.value.primary.average)).toBe(block.attacks[0]?.damage)
    expect(profile.value.primary.expression).not.toContain('d10')
    expect(profile.value.unresolvedCapabilities.map((entry) => entry.id)).toContain('versatile')

    const missing = resolveMonsterActionAttackProfile({
      action: {
        id: 'bite',
        kind: 'natural-weapon',
        name: 'Bite',
        mode: 'melee',
        damageType: 'piercing',
      },
      monster: kobold,
      equipmentCatalog,
      proficiencyBonus: 2,
      magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    })
    expect(missing).toEqual({ status: 'unavailable', reason: 'missing-input' })

    const unlinked = resolveMonsterActionAttackProfile({
      action: { id: 'hit', kind: 'weapon' },
      monster: kobold,
      equipmentCatalog,
      proficiencyBonus: 2,
      magicPropertyProvider: EMPTY_MAGIC_PROVIDER,
    })
    expect(unlinked).toEqual({ status: 'unavailable', reason: 'missing-reference' })
  })
})
