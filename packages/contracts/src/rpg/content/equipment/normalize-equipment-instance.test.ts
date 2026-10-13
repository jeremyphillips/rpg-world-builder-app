import { describe, expect, it } from 'vitest'

import { normalizeEquipmentInstance } from './normalize-equipment-instance'

describe('normalizeEquipmentInstance', () => {
  it('converts a legacy armor_class modifier into a mechanical effect', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'srd-cc-5.2.1:chain-shirt',
      quantity: 1,
      modifiers: [{ kind: 'armor_class', bonus: 2 }],
    })
    expect(next.modifiers).toBeUndefined()
    expect(next.mechanicalEffects).toEqual([
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

  it('does not add a mechanical effect when armor_class bonus nets to zero', () => {
    const next = normalizeEquipmentInstance({
      equipmentId: 'item',
      quantity: 1,
      modifiers: [
        { kind: 'armor_class', bonus: 1 },
        { kind: 'armor_class', bonus: -1 },
      ],
    })
    expect(next.mechanicalEffects).toBeUndefined()
  })
})
