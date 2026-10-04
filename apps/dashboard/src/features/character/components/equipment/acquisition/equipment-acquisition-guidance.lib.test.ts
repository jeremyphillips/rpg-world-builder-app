import { describe, expect, it } from 'vitest'

import type { EquipmentMagicItemSlot } from '@rpg/contracts'

import {
  formatEquipmentBudgetGuidanceCopy,
  formatEquipmentMagicItemSlotPresentation,
  resolveEquipmentAcquisitionGuidanceView,
} from './equipment-acquisition-guidance.lib'

describe('formatEquipmentBudgetGuidanceCopy', () => {
  it('keeps mixed denominations in remaining, budget, and spent copy', () => {
    expect(
      formatEquipmentBudgetGuidanceCopy({
        starting: { cp: 0, sp: 0, gp: 75, pp: 0 },
        spent: { cp: 0, sp: 4, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 6, gp: 74, pp: 0 },
      }),
    ).toEqual({
      heading: '74 GP 6 SP remaining',
      subheading: '75 GP budget · 4 SP spent',
    })

    expect(
      formatEquipmentBudgetGuidanceCopy({
        starting: { cp: 0, sp: 0, gp: 75, pp: 0 },
        spent: { cp: 4, sp: 4, gp: 0, pp: 0 },
        remaining: { cp: 6, sp: 5, gp: 74, pp: 0 },
      }),
    ).toEqual({
      heading: '74 GP 5 SP 6 CP remaining',
      subheading: '75 GP budget · 4 SP 4 CP spent',
    })
  })

  it('formats an empty purse as 0 GP', () => {
    expect(
      formatEquipmentBudgetGuidanceCopy({
        starting: { cp: 0, sp: 0, gp: 0, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 0, pp: 0 },
      }).heading,
    ).toBe('0 GP remaining')
  })
})

describe('resolveEquipmentAcquisitionGuidanceView', () => {
  it('renders nothing when neither currency nor magic slots are present', () => {
    expect(
      resolveEquipmentAcquisitionGuidanceView({
        showPurchaseWorkflow: false,
        fundingState: { kind: 'none' },
        showMagicItemGrants: false,
        magicItemAllowances: [],
        magicItemProgress: [],
      }),
    ).toBeUndefined()
  })
})

describe('formatEquipmentMagicItemSlotPresentation', () => {
  function slot(overrides: Partial<EquipmentMagicItemSlot>): EquipmentMagicItemSlot {
    return {
      rarity: 'common',
      rarityMode: 'exact',
      quantity: 2,
      remaining: 2,
      fulfilled: false,
      ...overrides,
    }
  }

  it('formats open and fulfilled exact and maximum slots', () => {
    expect(formatEquipmentMagicItemSlotPresentation(slot({}))).toEqual({
      lead: 'Common',
      detail: '2 remaining',
      accessibleName: 'Common · 2 remaining',
    })
    expect(
      formatEquipmentMagicItemSlotPresentation(
        slot({ remaining: 0, fulfilled: true, quantity: 2 }),
      ),
    ).toEqual({
      lead: 'Common',
      accessibleName: 'Common, complete',
    })
    expect(
      formatEquipmentMagicItemSlotPresentation(
        slot({ rarity: 'uncommon', rarityMode: 'maximum', quantity: 1, remaining: 1 }),
      ),
    ).toEqual({
      lead: 'Up to Uncommon',
      detail: '1 available',
      accessibleName: 'Up to Uncommon · 1 available',
    })
    expect(
      formatEquipmentMagicItemSlotPresentation(
        slot({
          rarity: 'uncommon',
          rarityMode: 'maximum',
          quantity: 1,
          remaining: 0,
          fulfilled: true,
        }),
      ),
    ).toEqual({
      lead: 'Up to Uncommon',
      accessibleName: 'Up to Uncommon, complete',
    })
  })
})
