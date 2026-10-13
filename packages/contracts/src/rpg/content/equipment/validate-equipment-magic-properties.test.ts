import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../equipment'
import {
  EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE,
  validateEquipmentMagicProperties,
} from './validate-equipment-magic-properties'
import type { MagicPropertyDefinitionProvider } from './magic-property'

const RULESET = 'srd-cc-5.2.1'

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
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
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
})

const provider: MagicPropertyDefinitionProvider = (id) => {
  if (id === `${RULESET}:weapon-enhancement-1`) {
    return {
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
  }
  if (id === `${RULESET}:armor-enhancement-1`) {
    return {
      id,
      name: 'Armor +1',
      description: 'test',
      category: 'enhancement',
      appliesTo: ['armor'],
      effects: [{ target: 'armor_class', bonus: 1 }],
    }
  }
  return undefined
}

describe('validateEquipmentMagicProperties', () => {
  it('rejects inapplicable presets and duplicate mechanical targets', () => {
    const inapplicable = validateEquipmentMagicProperties({
      entry: {
        equipmentId: longsword.id,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: `${RULESET}:armor-enhancement-1` }],
      },
      item: longsword,
      provider,
      pathPrefix: 'equipment.0',
    })
    expect(inapplicable.map((row) => row.code)).toEqual([
      EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.inapplicablePreset,
    ])

    const duplicateTarget = validateEquipmentMagicProperties({
      entry: {
        equipmentId: longsword.id,
        mechanicalEffects: [
          { effectId: 'a', target: 'attack_roll', bonus: 1 },
          { effectId: 'b', target: 'attack_roll', bonus: 2 },
        ],
      },
      item: longsword,
      provider,
      pathPrefix: 'equipment.0',
    })
    expect(duplicateTarget.map((row) => row.code)).toEqual([
      EQUIPMENT_MAGIC_PROPERTY_ISSUE_CODE.duplicateEffectTarget,
    ])
  })
})
