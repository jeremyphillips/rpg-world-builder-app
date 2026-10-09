import { describe, expect, it } from 'vitest'

import type { MagicItemAllowance, MagicItemGrantProgress } from '@rpg/contracts'

import {
  formatEquipmentBudgetGuidanceCopy,
  formatEquipmentMagicItemSlotPresentation,
} from '../../acquisition/equipment-acquisition-guidance.lib'
import { equipmentPickerBudgetFixture } from './equipment-picker-drawer.fixtures'
import { resolveEquipmentPickerHeaderResource } from './equipment-picker-header-resource.lib'

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

const commonAllowance = allowance({
  id: 'common',
  rarity: 'common',
  requirement: 'exact',
  count: 2,
})
const uncommonUpTo = allowance({ id: 'uncommon', rarity: 'uncommon', requirement: 'up_to' })

describe('resolveEquipmentPickerHeaderResource', () => {
  it('projects the original purchase budget as currency', () => {
    expect(
      resolveEquipmentPickerHeaderResource({
        workflowMode: 'purchase',
        budget: equipmentPickerBudgetFixture,
        magicItemAllowances: [commonAllowance],
        magicItemGrantProgress: [progress('common', 'common', 2, 0)],
      }),
    ).toEqual({
      kind: 'currency',
      currency: formatEquipmentBudgetGuidanceCopy(equipmentPickerBudgetFixture),
    })
  })

  it('returns nothing for purchase mode without a budget', () => {
    expect(
      resolveEquipmentPickerHeaderResource({
        workflowMode: 'purchase',
        magicItemAllowances: [commonAllowance],
        magicItemGrantProgress: [progress('common', 'common', 2, 0)],
      }),
    ).toBeUndefined()
  })

  it('projects magic-item slots from allowances and progress, ignoring budget', () => {
    const resource = resolveEquipmentPickerHeaderResource({
      workflowMode: 'magic_items',
      budget: equipmentPickerBudgetFixture,
      magicItemAllowances: [commonAllowance],
      magicItemGrantProgress: [progress('common', 'common', 2, 0)],
    })

    expect(resource?.kind).toBe('magicItems')
    if (resource?.kind !== 'magicItems') return
    expect(resource.slots).toEqual([
      {
        rarity: 'common',
        rarityMode: 'exact',
        quantity: 2,
        remaining: 2,
        fulfilled: false,
      },
    ])
  })

  it('keeps an up-to allowance as a maximum slot', () => {
    const resource = resolveEquipmentPickerHeaderResource({
      workflowMode: 'magic_items',
      magicItemAllowances: [uncommonUpTo],
      magicItemGrantProgress: [progress('uncommon', 'uncommon', 1, 0)],
    })

    expect(resource?.kind).toBe('magicItems')
    if (resource?.kind !== 'magicItems') return
    expect(formatEquipmentMagicItemSlotPresentation(resource.slots[0]!).lead).toBe('Up to Uncommon')
  })

  it('returns nothing when magic-item slot resolution is empty', () => {
    expect(
      resolveEquipmentPickerHeaderResource({
        workflowMode: 'magic_items',
        budget: equipmentPickerBudgetFixture,
        magicItemAllowances: [],
        magicItemGrantProgress: [],
      }),
    ).toBeUndefined()
  })
})
