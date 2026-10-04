import { describe, expect, it } from 'vitest'

import type {
  MagicItemAllowance,
  MagicItemGrantProgress,
} from '../../equipment/magic-item-selection'
import { resolveEquipmentMagicItemSlots } from './resolve-equipment-magic-item-slots'

function allowance(
  overrides: Partial<MagicItemAllowance> &
    Pick<MagicItemAllowance, 'id' | 'rarity' | 'requirement'>,
): MagicItemAllowance {
  return {
    source: { kind: 'startingWealthTier', sourceId: 'table', tierId: 'hero' },
    count: 1,
    ...overrides,
  }
}

function progress(
  allowanceId: string,
  rarity: MagicItemGrantProgress['rarity'],
  capacity: number,
  selected: number,
): MagicItemGrantProgress {
  return {
    allowanceId,
    rarity,
    capacity,
    selected,
    remainingCapacity: Math.max(0, capacity - selected),
    isFilled: selected >= capacity,
  }
}

describe('resolveEquipmentMagicItemSlots', () => {
  it('returns slots when every allowance is fulfilled', () => {
    const slots = resolveEquipmentMagicItemSlots({
      allowances: [allowance({ id: 'common', rarity: 'common', requirement: 'exact' })],
      progress: [progress('common', 'common', 1, 1)],
    })

    expect(slots).toEqual([
      {
        rarity: 'common',
        rarityMode: 'exact',
        quantity: 1,
        remaining: 0,
        fulfilled: true,
      },
    ])
  })

  it('aggregates duplicate same-rarity allowances into one slot', () => {
    const slots = resolveEquipmentMagicItemSlots({
      allowances: [
        allowance({ id: 'common-a', rarity: 'common', requirement: 'exact', count: 1 }),
        allowance({ id: 'common-b', rarity: 'common', requirement: 'exact', count: 1 }),
      ],
      progress: [progress('common-a', 'common', 1, 0), progress('common-b', 'common', 1, 0)],
    })

    expect(slots).toEqual([
      {
        rarity: 'common',
        rarityMode: 'exact',
        quantity: 2,
        remaining: 2,
        fulfilled: false,
      },
    ])
  })

  it('keeps exact and maximum slots at the same rarity separate', () => {
    const slots = resolveEquipmentMagicItemSlots({
      allowances: [
        allowance({ id: 'exact', rarity: 'common', requirement: 'exact' }),
        allowance({ id: 'maximum', rarity: 'common', requirement: 'up_to' }),
      ],
      progress: [progress('exact', 'common', 1, 0), progress('maximum', 'common', 1, 0)],
    })

    expect(slots.map((slot) => slot.rarityMode)).toEqual(['exact', 'maximum'])
    expect(slots).toHaveLength(2)
  })

  it('returns no slots when there are no allowances', () => {
    expect(resolveEquipmentMagicItemSlots({ allowances: [], progress: [] })).toEqual([])
  })
})
