import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../equipment'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import { resolveEquipmentMagicProperties } from './resolve-equipment-magic-properties'
import {
  formatEquipmentMechanicalComponentsForTarget,
  formatEquipmentMechanicalComponentSegments,
} from './equipment-mechanical-metadata'

const weapon = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:shortsword',
  slug: 'shortsword',
  rulesetId: 'srd-cc-5.2.1',
  catalogLayer: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shortsword',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  properties: ['finesse', 'light'],
  mastery: 'vex',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
})

const ENHANCEMENT_ID = 'srd-cc-5.2.1:weapon-enhancement-1'

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
  return undefined
}

describe('equipment mechanical metadata', () => {
  it('formats enhancement and adjustment components for overlap copy', () => {
    expect(
      formatEquipmentMechanicalComponentSegments({
        enhancementBonus: 1,
        adjustmentBonus: 2,
      }),
    ).toEqual(['+1 enhancement', '+2 adjustment'])
  })

  it('builds per-target overlap summary from entry and magic', () => {
    const entry = {
      equipmentId: weapon.id,
      magical: true,
      magicProperties: [{ kind: 'preset' as const, propertyId: ENHANCEMENT_ID }],
      adjustments: [{ effectId: 'a1', target: 'attack_roll' as const, bonus: 2 }],
    }
    const magic = resolveEquipmentMagicProperties(entry, weapon, provider)
    expect(formatEquipmentMechanicalComponentsForTarget(entry, magic, 'attack_roll')).toBe(
      '+1 enhancement · +2 adjustment',
    )
  })
})
