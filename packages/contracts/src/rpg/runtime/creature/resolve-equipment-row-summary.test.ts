import { describe, expect, it } from 'vitest'

import { equipmentSchema, isArmorEquipment, monsterSchema, type Equipment } from '../../content'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { proficiencyBonus } from '../../primitives/level/level'
import { CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { deriveMonsterStatBlock } from '../monster/stat-block'
import { resolveInventoryWeaponAttackTotals } from './resolve-inventory-weapon-attack'
import { resolveEquipmentRowSummary } from './resolve-equipment-row-summary'
import { resolveWeaponAttackAbilityModifier } from './weapon-attack'

const RULESET = 'srd-cc-5.2.1'
const ENHANCEMENT_ID = `${RULESET}:weapon-enhancement-1`
const ATTACK_ONLY_ID = `${RULESET}:attack-only`
const DAMAGE_ONLY_ID = `${RULESET}:damage-only`

function weapon(
  slug: string,
  extra: Record<string, unknown> = {},
): Extract<Equipment, { kind: 'weapon' }> {
  const row = equipmentSchema.parse({
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
    properties: [],
    mastery: 'nick',
    damage: { dice: { count: 1, faces: 8 } },
    damageType: 'slashing',
    ...extra,
  })
  if (row.kind !== 'weapon') throw new Error('expected weapon')
  return row
}

const battleaxe = weapon('battleaxe', { name: 'Battleaxe', category: 'martial' })
const rapier = weapon('rapier', {
  name: 'Rapier',
  category: 'martial',
  properties: ['finesse'],
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'piercing',
})
const dagger = weapon('dagger', {
  name: 'Dagger',
  properties: ['finesse', 'light', 'thrown'],
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
})
const shortbow = weapon('shortbow', {
  name: 'Shortbow',
  mode: 'ranged',
  properties: ['ammunition', 'two-handed'],
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
})
const longsword = weapon('longsword', {
  name: 'Longsword',
  category: 'martial',
  properties: ['versatile'],
  versatileDamage: { count: 1, faces: 10 },
})
const net = weapon('net', {
  name: 'Net',
  properties: ['thrown'],
  damage: undefined,
  damageType: undefined,
})

const armor = equipmentSchema.parse({
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
  stealthDisadvantage: false,
})

const emptyProvider: MagicPropertyDefinitionProvider = () => undefined

const provider: MagicPropertyDefinitionProvider = (id) => {
  if (id === ENHANCEMENT_ID) {
    return {
      id,
      name: 'Enhancement +1',
      description: '',
      category: 'enhancement',
      appliesTo: ['weapon'],
      effects: [
        { target: 'attack_roll', bonus: 1 },
        { target: 'damage_roll', bonus: 1 },
      ],
    }
  }
  if (id === ATTACK_ONLY_ID) {
    return {
      id,
      name: 'Attack +2',
      description: '',
      category: 'enhancement',
      appliesTo: ['weapon'],
      effects: [{ target: 'attack_roll', bonus: 2 }],
    }
  }
  if (id === DAMAGE_ONLY_ID) {
    return {
      id,
      name: 'Damage +2',
      description: '',
      category: 'special',
      appliesTo: ['weapon'],
      effects: [{ target: 'damage_roll', bonus: 2 }],
    }
  }
  return undefined
}

function entry(
  item: Equipment,
  extra: Record<string, unknown> = {},
): {
  entryId: string
  equipmentId: string
  quantity: number
} {
  return { entryId: 'row', equipmentId: item.id, quantity: 1, ...extra }
}

const proficientMartial = { categories: ['martial' as const], items: [] as string[] }
const noProficiencies = { categories: [] as ('simple' | 'martial')[], items: [] as string[] }

describe('resolveEquipmentRowSummary', () => {
  it('adds proficiency only when the creature is proficient', () => {
    const scores = { str: 16, dex: 10 }
    const proficient = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: scores,
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const untrained = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: scores,
        proficiencyBonus: 2,
        weaponProficiencies: noProficiencies,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )

    expect(proficient?.proficient).toBe(true)
    expect(proficient?.attackBonus).toBe(5)
    expect(proficient?.supportingMetadata).toEqual(['1d8+3 slashing', '+5 to hit'])
    expect(untrained?.proficient).toBe(false)
    expect(untrained?.attackBonus).toBe(3)
    expect(untrained?.supportingMetadata).toEqual(['1d8+3 slashing', '+3 to hit'])
  })

  it('matches inventory attack totals and the monster catalog weapon line', () => {
    const scores = { str: 16, dex: 14, con: 10, int: 10, wis: 10, cha: 10 }
    const weaponEntry = entry(battleaxe)
    const summary = resolveEquipmentRowSummary(
      weaponEntry,
      battleaxe,
      {
        abilityScores: scores,
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const abilityModifier = resolveWeaponAttackAbilityModifier(battleaxe, scores)!
    const totals = resolveInventoryWeaponAttackTotals({
      entry: weaponEntry,
      item: battleaxe,
      abilityModifier,
      proficient: true,
      proficiencyBonus: 2,
      provider: emptyProvider,
    })
    const monster = monsterSchema.parse({
      id: `${RULESET}:axe-fighter`,
      slug: 'axe-fighter',
      rulesetId: RULESET,
      source: 'system',
      status: 'published',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Axe Fighter',
      description: '<p>Fighter</p>',
      size: 'medium',
      creatureType: 'humanoid',
      alignment: 'n',
      abilityScores: scores,
      armorClass: { naturalArmorBonus: 2 },
      hitPoints: { kind: 'hit-dice', count: 2 },
      movement: { walk: 30 },
      senses: [],
      communication: {},
      challengeRating: '0',
      proficiencies: {
        savingThrows: [],
        skills: [],
        languages: [],
        weapons: [{ weaponCategory: 'martial' }],
      },
      defenses: {
        vulnerabilities: [],
        resistances: [],
        immunities: [],
        conditionImmunities: [],
      },
      equipment: [weaponEntry],
      traits: [],
      actions: [{ id: 'axe', kind: 'weapon', equipmentEntryId: 'row' }],
      bonusActions: [],
      reactions: [],
    })
    const attack = deriveMonsterStatBlock({
      monster,
      equipmentCatalog: new Map([[battleaxe.id, battleaxe]]),
      skillCatalog: new Map(),
      acBase: 10,
      magicPropertyProvider: emptyProvider,
    }).attacks[0]

    expect(summary?.attackBonus).toBe(totals?.attackBonus)
    expect(summary?.attackBonus).toBe(attack?.attackBonus)
  })

  it('uses DEX for ranged weapons and the higher finesse score for melee', () => {
    const scores = { str: 18, dex: 12 }
    const bow = resolveEquipmentRowSummary(
      entry(shortbow),
      shortbow,
      {
        abilityScores: scores,
        proficiencyBonus: 2,
        weaponProficiencies: { categories: ['simple'], items: [] },
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const finesse = resolveEquipmentRowSummary(
      entry(rapier),
      rapier,
      {
        abilityScores: { str: 8, dex: 14 },
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const thrownMelee = resolveEquipmentRowSummary(
      entry(dagger),
      dagger,
      {
        abilityScores: scores,
        proficiencyBonus: 2,
        weaponProficiencies: { categories: ['simple'], items: [] },
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )

    expect(bow?.damage?.modifier).toBe(1)
    expect(bow?.attackBonus).toBe(3)
    expect(finesse?.damage?.modifier).toBe(2)
    expect(finesse?.supportingMetadata[0]).toBe('1d8+2 piercing')
    expect(thrownMelee?.damage?.modifier).toBe(4)
    expect(thrownMelee?.supportingMetadata[0]).toBe('1d4+4 piercing')
  })

  it('uses the same proficiency bonus from character level and monster CR', () => {
    expect(proficiencyBonus(5)).toBe(CHALLENGE_RATING_MECHANICS['5'].proficiencyBonus)
    const context = {
      abilityScores: { str: 14 },
      weaponProficiencies: proficientMartial,
      omitSharedEnhancement: false,
    }
    const fromLevel = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      { ...context, proficiencyBonus: proficiencyBonus(5) },
      emptyProvider,
    )
    const fromCr = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      { ...context, proficiencyBonus: CHALLENGE_RATING_MECHANICS['5'].proficiencyBonus },
      emptyProvider,
    )
    expect(fromLevel?.attackBonus).toBe(5)
    expect(fromCr?.attackBonus).toBe(fromLevel?.attackBonus)
  })

  it('applies magic and adjustments only to the targets those effects list', () => {
    const scores = { str: 10 }
    const context = {
      abilityScores: scores,
      proficiencyBonus: 2,
      weaponProficiencies: proficientMartial,
      omitSharedEnhancement: true,
    }
    const both = resolveEquipmentRowSummary(
      entry(battleaxe, {
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
        adjustments: [{ effectId: 'manual', target: 'attack_roll', bonus: 1 }],
      }),
      battleaxe,
      context,
      provider,
    )
    const attackOnly = resolveEquipmentRowSummary(
      entry(battleaxe, {
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: ATTACK_ONLY_ID }],
      }),
      battleaxe,
      context,
      provider,
    )
    const damageOnly = resolveEquipmentRowSummary(
      entry(battleaxe, {
        magicProperties: [{ kind: 'preset', propertyId: DAMAGE_ONLY_ID }],
        adjustments: [{ effectId: 'manual', target: 'damage_roll', bonus: -1 }],
      }),
      battleaxe,
      context,
      provider,
    )

    expect(both?.attackBonus).toBe(4)
    expect(both?.damage?.modifier).toBe(1)
    expect(both?.supportingMetadata).toEqual(['1d8+1 slashing', '+4 to hit'])
    expect(both?.adjustmentSegments).toEqual(['+1 attack adjustment'])
    expect(attackOnly?.attackBonus).toBe(4)
    expect(attackOnly?.damage?.modifier).toBe(0)
    expect(attackOnly?.adjustmentSegments).toEqual(['+2 attack roll'])
    expect(damageOnly?.attackBonus).toBe(2)
    expect(damageOnly?.damage?.modifier).toBe(1)
    expect(damageOnly?.adjustmentSegments).toEqual(['-1 damage adjustment'])
  })

  it('formats negative and zero modifiers without dropping a resolved zero', () => {
    const negative = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: { str: 8 },
        proficiencyBonus: 2,
        weaponProficiencies: noProficiencies,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const zero = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: { str: 10 },
        proficiencyBonus: 2,
        weaponProficiencies: noProficiencies,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )

    expect(negative?.supportingMetadata).toEqual(['1d8-1 slashing', '-1 to hit'])
    expect(zero?.supportingMetadata).toEqual(['1d8 slashing', '+0 to hit'])
  })

  it('keeps the one-handed die when the weapon is versatile', () => {
    const summary = resolveEquipmentRowSummary(
      entry(longsword),
      longsword,
      {
        abilityScores: { str: 16 },
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    expect(summary?.damage?.expression).toBe('1d8+3')
    expect(summary?.supportingMetadata[0]).toBe('1d8+3 slashing')
  })

  it('omits unresolved attack or damage flats instead of substituting zero', () => {
    const missingScore = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: { dex: 16 },
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const missingProficiency = resolveEquipmentRowSummary(
      entry(battleaxe),
      battleaxe,
      {
        abilityScores: { str: 16 },
        proficiencyBonus: undefined,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )

    expect(missingScore?.availability).toEqual({
      damageDice: true,
      damageModifier: false,
      attackBonus: false,
    })
    expect(missingScore?.supportingMetadata).toEqual(['1d8 slashing'])
    expect(missingProficiency?.availability.attackBonus).toBe(false)
    expect(missingProficiency?.supportingMetadata).toEqual(['1d8+3 slashing'])
  })

  it('shows a shared adjustment and keeps a custom-name enhancement on the status line', () => {
    const shared = resolveEquipmentRowSummary(
      entry(battleaxe, {
        adjustments: [
          { effectId: 'atk', target: 'attack_roll', bonus: -1 },
          { effectId: 'dmg', target: 'damage_roll', bonus: -1 },
        ],
      }),
      battleaxe,
      {
        abilityScores: { str: 14 },
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    const named = resolveEquipmentRowSummary(
      entry(battleaxe, {
        customName: 'Old Axe',
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
      }),
      battleaxe,
      {
        abilityScores: { str: 14 },
        proficiencyBonus: 2,
        weaponProficiencies: proficientMartial,
        omitSharedEnhancement: false,
      },
      provider,
    )

    expect(shared?.adjustmentSegments).toEqual(['-1 damage adjustment', '-1 attack adjustment'])
    expect(shared?.attackBonus).toBe(3)
    expect(shared?.damage?.modifier).toBe(1)
    expect(named?.adjustmentSegments).toEqual(['+1 enhancement'])
  })

  it('still reports to-hit for a weapon with no damage dice', () => {
    const summary = resolveEquipmentRowSummary(
      entry(net),
      net,
      {
        abilityScores: { str: 12 },
        proficiencyBonus: 2,
        weaponProficiencies: { categories: ['simple'], items: [] },
        omitSharedEnhancement: false,
      },
      emptyProvider,
    )
    expect(summary?.availability.damageDice).toBe(false)
    expect(summary?.supportingMetadata).toEqual(['+3 to hit'])
  })

  it('returns no summary for armor', () => {
    expect(isArmorEquipment(armor)).toBe(true)
    expect(
      resolveEquipmentRowSummary(
        entry(armor),
        armor,
        {
          abilityScores: { str: 16, dex: 14 },
          proficiencyBonus: 2,
          weaponProficiencies: noProficiencies,
          omitSharedEnhancement: false,
        },
        emptyProvider,
      ),
    ).toBeUndefined()
  })
})
