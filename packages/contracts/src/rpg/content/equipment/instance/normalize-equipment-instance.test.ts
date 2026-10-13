import { describe, expect, it } from 'vitest'

import type { EquipmentInstance } from './instance'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'

describe('normalizeEquipmentInstance', () => {
  it('converts a legacy armor_class modifier into an adjustment', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'srd-cc-5.2.1:chain-shirt',
      quantity: 1,
      modifiers: [{ kind: 'armor_class', bonus: 2 }],
    } as EquipmentInstance)
    expect(next.modifiers).toBeUndefined()
    expect(next).not.toHaveProperty('mechanicalEffects')
    expect(next.adjustments).toEqual([
      { effectId: 'legacy-armor-class-modifier', target: 'armor_class', bonus: 2 },
    ])
  })

  it('is idempotent after converting legacy armor_class modifiers', () => {
    const once = normalizeEquipmentInstance({
      equipmentId: 'srd-cc-5.2.1:chain-shirt',
      quantity: 1,
      modifiers: [{ kind: 'armor_class', bonus: 2 }],
    })
    const twice = normalizeEquipmentInstance(once)
    expect(twice).toEqual(once)
  })

  it('does not add an adjustment when armor_class bonus nets to zero', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'item',
      quantity: 1,
      modifiers: [
        { kind: 'armor_class', bonus: 1 },
        { kind: 'armor_class', bonus: -1 },
      ],
    } as EquipmentInstance)
    expect(next.adjustments).toBeUndefined()
  })

  it('prefers an explicit empty adjustments array over legacy mechanicalEffects', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'item',
      quantity: 1,
      adjustments: [],
      mechanicalEffects: [{ effectId: 'legacy', target: 'attack_roll', bonus: 1 }],
    } as EquipmentInstance & { mechanicalEffects: unknown[] })
    expect(next.adjustments).toBeUndefined()
    expect(next).not.toHaveProperty('mechanicalEffects')
  })

  it('uses adjustments when both adjustments and mechanicalEffects are present', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'item',
      quantity: 1,
      adjustments: [{ effectId: 'a1', target: 'damage_roll', bonus: 2 }],
      mechanicalEffects: [{ effectId: 'ignored', target: 'attack_roll', bonus: 1 }],
    } as EquipmentInstance & { mechanicalEffects: unknown[] })
    expect(next.adjustments).toEqual([{ effectId: 'a1', target: 'damage_roll', bonus: 2 }])
  })

  it('does not merge legacy armor_class modifiers when an armor_class adjustment exists', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'item',
      quantity: 1,
      adjustments: [{ effectId: 'ac', target: 'armor_class', bonus: 1 }],
      modifiers: [{ kind: 'armor_class', bonus: 3 }],
    } as EquipmentInstance)
    expect(next.modifiers).toBeUndefined()
    expect(next.adjustments).toEqual([{ effectId: 'ac', target: 'armor_class', bonus: 1 }])
  })
})
