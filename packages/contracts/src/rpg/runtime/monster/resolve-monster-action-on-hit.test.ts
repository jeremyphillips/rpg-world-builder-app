import { describe, expect, it } from 'vitest'

import { equipmentSchema, isWeaponEquipment } from '../../content'
import type { MagicPropertyDefinition } from '../../content/equipment/instance/magic-property'
import { formatMonsterAttackAction } from './format-monster-attack-action'
import { resolveMonsterActionAttackProfile } from './resolve-monster-action-attack-profile'

const RULESET = 'srd-cc-5.2.1'
const SWORD_ID = `${RULESET}:longsword`

const longsword = equipmentSchema.parse({
  id: SWORD_ID,
  slug: 'longsword',
  rulesetId: RULESET,
  catalogLayer: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  properties: ['finesse'],
  mastery: 'nick',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
})

if (!isWeaponEquipment(longsword)) throw new Error('expected a weapon')

const extraFire: MagicPropertyDefinition = {
  id: `${RULESET}:extra-fire`,
  name: 'Extra fire',
  description: 'This weapon deals an extra 1d6 Fire damage on a hit.',
  category: 'special',
  appliesTo: ['weapon'],
  effects: [],
  onHit: {
    effects: [{ kind: 'damage', roll: { dice: { count: 1, faces: 6 } }, damageType: 'fire' }],
  },
}

const flameTongue: MagicPropertyDefinition = {
  id: `${RULESET}:flame-tongue`,
  name: 'Flame Tongue',
  description:
    'While the weapon is ablaze, it deals an extra 2d6 Fire damage on a hit. The flames last until you take a Bonus Action to extinguish them.',
  category: 'special',
  appliesTo: ['weapon'],
  effects: [],
}

function provider(id: string): MagicPropertyDefinition | undefined {
  if (id === extraFire.id) return extraFire
  if (id === flameTongue.id) return flameTongue
  return undefined
}

describe('resolveMonsterActionAttackProfile on-hit effects', () => {
  it('derives Paralyzing Touch from Intelligence and keeps the condition off the damage total', () => {
    const profile = resolveMonsterActionAttackProfile({
      action: {
        id: 'paralyzing-touch',
        kind: 'attack',
        name: 'Paralyzing Touch',
        modes: ['melee'],
        reach: 5,
        damage: { dice: { count: 3, faces: 6 } },
        damageType: 'cold',
        bonusSource: { kind: 'ability', ability: 'int', proficient: true },
        onHit: {
          effects: [
            {
              kind: 'condition',
              conditionId: 'paralyzed',
              description: "until the start of the lich's next turn",
            },
          ],
        },
      },
      monster: {
        abilityScores: { str: 11, dex: 16, con: 16, int: 21, wis: 14, cha: 16 },
      },
      equipmentCatalog: new Map(),
      proficiencyBonus: 7,
      magicPropertyProvider: () => undefined,
    })

    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(profile.value.attackBonus).toBe(12)
    expect(profile.value.primary).toEqual({
      expression: '3d6+5',
      average: 15,
      damageTypeId: 'cold',
    })
    expect(profile.value.onHit).toEqual([
      {
        kind: 'condition',
        source: 'action',
        conditionId: 'paralyzed',
        description: "until the start of the lich's next turn",
      },
    ])
    expect(
      formatMonsterAttackAction({
        attackBonusLabel: '+12',
        damage: String(profile.value.primary.average),
        damageExpression: profile.value.primary.expression,
        damageTypeId: profile.value.primary.damageTypeId,
        modes: profile.value.modes,
        reach: profile.value.reach,
        onHit: profile.value.onHit,
      }),
    ).toBe(
      "Melee Attack Roll: +12, reach 5 ft. Hit: 15 (3d6 + 5) Cold damage, and the target has the Paralyzed condition until the start of the lich's next turn.",
    )
  })

  it('appends unconditional property damage after action effects and ignores Flame Tongue prose', () => {
    const shared = {
      monster: {
        abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencies: { weapons: [{ weaponCategory: 'martial' as const }] },
        equipment: [
          {
            entryId: 'sword',
            equipmentId: SWORD_ID,
            quantity: 1,
            equipped: true,
            magical: true,
            magicProperties: [
              { kind: 'preset' as const, propertyId: extraFire.id },
              { kind: 'preset' as const, propertyId: flameTongue.id },
            ],
          },
        ],
      },
      equipmentCatalog: new Map([[SWORD_ID, longsword]]),
      proficiencyBonus: 2,
      magicPropertyProvider: provider,
    }
    const mixed = resolveMonsterActionAttackProfile({
      ...shared,
      action: {
        id: 'slash',
        kind: 'weapon',
        equipmentEntryId: 'sword',
        onHit: {
          effects: [
            { kind: 'damage', roll: { dice: { count: 1, faces: 4 } }, damageType: 'radiant' },
          ],
        },
      },
    })
    expect(mixed.status).toBe('resolved')
    if (mixed.status !== 'resolved') return
    expect(mixed.value.primary.average).toBe(7)
    expect(mixed.value.attackBonus).toBe(5)
    expect(
      mixed.value.onHit.map((effect) => effect.kind === 'damage' && effect.damageTypeId),
    ).toEqual(['radiant', 'fire'])
    expect(mixed.value.onHit.map((effect) => effect.source)).toEqual(['action', 'magic-property'])
    expect(mixed.value.onHit[1]).toMatchObject({ propertyId: extraFire.id, average: 3 })

    const proseOnly = resolveMonsterActionAttackProfile({
      ...shared,
      action: { id: 'slash', kind: 'weapon', equipmentEntryId: 'sword' },
      monster: {
        ...shared.monster,
        equipment: [
          {
            ...shared.monster.equipment[0]!,
            magicProperties: [{ kind: 'preset', propertyId: flameTongue.id }],
          },
        ],
      },
    })
    expect(proseOnly.status).toBe('resolved')
    if (proseOnly.status !== 'resolved') return
    expect(proseOnly.value.onHit).toEqual([])
    expect(proseOnly.value.primary.average).toBe(7)
  })
})
