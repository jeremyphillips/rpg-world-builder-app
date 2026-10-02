import { describe, expect, it, vi } from 'vitest'

import type { Equipment } from '../../../../content/equipment'
import { resolveEquipmentAdditionPolicy } from './resolve-equipment-addition-policy'

vi.mock('../../../../content/equipment/stackable', () => ({
  isEquipmentStackable: vi.fn((equipment: { id?: string }) => equipment.id !== 'unique'),
}))

const stackable = { id: 'rope', kind: 'adventuring_gear' } as Equipment
const unique = { id: 'unique', kind: 'weapon' } as Equipment

describe('resolveEquipmentAdditionPolicy', () => {
  it('uses stackability for grant and inventory context', () => {
    expect(
      resolveEquipmentAdditionPolicy({ equipment: stackable, context: { kind: 'grant' } }),
    ).toBe('quantity')
    expect(
      resolveEquipmentAdditionPolicy({ equipment: stackable, context: { kind: 'inventory' } }),
    ).toBe('quantity')
    expect(resolveEquipmentAdditionPolicy({ equipment: unique, context: { kind: 'grant' } })).toBe(
      'single',
    )
  })

  it('returns blocked for a blocked acquisition even when the item is stackable', () => {
    expect(
      resolveEquipmentAdditionPolicy({
        equipment: stackable,
        context: { kind: 'acquisition', blocked: true },
      }),
    ).toBe('blocked')
    expect(
      resolveEquipmentAdditionPolicy({
        equipment: stackable,
        context: { kind: 'acquisition', blocked: false },
      }),
    ).toBe('quantity')
  })
})
