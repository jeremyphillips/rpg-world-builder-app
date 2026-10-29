import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../equipment'
import { equipmentInstanceSchema } from './instance'
import { resolveEquipmentEntryEffectTotals } from './equipment-effect-totals'
import { resolveEquipmentEffectWarnings } from './equipment-effect-warnings'
import { resolveEquipmentMagicProperties } from './resolve-equipment-magic-properties'
import type { MagicPropertyDefinitionProvider } from './magic-property'

const weapon = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
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
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
})

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

describe('equipment instance schema', () => {
  it('rejects magic properties when magical is false', () => {
    const result = equipmentInstanceSchema.safeParse({
      equipmentId: 'srd-cc-5.2.1:longsword',
      magical: false,
      magicProperties: [{ kind: 'custom', customId: 'c1', name: 'Glow', description: 'Shines' }],
    })
    expect(result.success).toBe(false)
  })

  it('allows magical entries with zero properties', () => {
    expect(
      equipmentInstanceSchema.parse({
        equipmentId: 'srd-cc-5.2.1:longsword',
        magical: true,
      }).magical,
    ).toBe(true)
  })
})

describe('resolveEquipmentMagicProperties', () => {
  it('separates unresolved presets from inapplicable and custom entries', () => {
    const resolved = resolveEquipmentMagicProperties(
      {
        equipmentId: weapon.id,
        magical: true,
        magicProperties: [
          { kind: 'preset', propertyId: 'missing' },
          { kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' },
          { kind: 'custom', customId: 'c1', name: 'Glow', description: 'Shines' },
        ],
      },
      weapon,
      provider,
    )
    expect(resolved.unresolved).toHaveLength(1)
    expect(resolved.resolved).toHaveLength(1)
    expect(resolved.custom).toHaveLength(1)
    const armor = equipmentSchema.parse({
      ...weapon,
      kind: 'armor',
      category: 'medium',
      baseAcOffset: 4,
      stealthDisadvantage: false,
      mode: undefined,
      properties: undefined,
      mastery: undefined,
      damage: undefined,
      damageType: undefined,
    })
    expect(
      resolveEquipmentMagicProperties(
        {
          equipmentId: armor.id,
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
        },
        armor,
        provider,
      ).inapplicable,
    ).toHaveLength(1)
  })
})

describe('effect totals and warnings', () => {
  it('combines enhancement and manual effects without double counting', () => {
    const totals = resolveEquipmentEntryEffectTotals(
      {
        equipmentId: weapon.id,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
        adjustments: [{ effectId: 'e1', target: 'attack_roll', bonus: 1 }],
      },
      weapon,
      provider,
    )
    expect(totals).toEqual({ attack_roll: 2, damage_roll: 1, armor_class: 0 })
  })

  it('warns when enhancement plus manual total exceeds standard +3 on attack', () => {
    const warnings = resolveEquipmentEffectWarnings({
      entry: {
        equipmentId: weapon.id,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
        adjustments: [{ effectId: 'e1', target: 'attack_roll', bonus: 3 }],
      },
      item: weapon,
      provider,
    })
    expect(warnings.some((row) => row.code === 'above_standard_enhancement')).toBe(true)
  })

  it('does not warn on a high manual modifier alone without an enhancement', () => {
    const warnings = resolveEquipmentEffectWarnings({
      entry: {
        equipmentId: weapon.id,
        adjustments: [{ effectId: 'e1', target: 'attack_roll', bonus: 4 }],
      },
      item: weapon,
      provider: () => undefined,
    })
    expect(warnings.some((row) => row.code === 'above_standard_enhancement')).toBe(false)
  })
})
