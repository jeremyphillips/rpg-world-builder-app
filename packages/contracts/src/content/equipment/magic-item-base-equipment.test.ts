import { describe, expect, it } from 'vitest'

import {
  isMagicItemBaseEquipment,
  isMagicItemBaseEquipmentKind,
  MAGIC_ITEM_BASE_EQUIPMENT_KINDS,
} from './magic-item-base-equipment'

describe('MAGIC_ITEM_BASE_EQUIPMENT_KINDS', () => {
  it('includes weapons, armor, and adventuring gear only', () => {
    expect(MAGIC_ITEM_BASE_EQUIPMENT_KINDS).toEqual(['weapon', 'armor', 'adventuring_gear'])
  })

  it('isMagicItemBaseEquipmentKind narrows eligible kinds', () => {
    expect(isMagicItemBaseEquipmentKind('weapon')).toBe(true)
    expect(isMagicItemBaseEquipmentKind('tool')).toBe(false)
  })

  it('isMagicItemBaseEquipment filters catalog equipment', () => {
    expect(isMagicItemBaseEquipment({ kind: 'armor' })).toBe(true)
    expect(isMagicItemBaseEquipment({ kind: 'tool' })).toBe(false)
  })
})
