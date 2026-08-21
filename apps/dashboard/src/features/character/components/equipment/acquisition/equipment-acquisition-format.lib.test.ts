import { describe, expect, it } from 'vitest'

import {
  formatGrantPreviewLine,
  formatTotalPurchaseSpendFromSnapshots,
  formatUsesGrantPreviewLine,
} from './equipment-acquisition-format.lib'

describe('equipment-acquisition-format.lib', () => {
  it('sums purchase spend from stored unit cost snapshots', () => {
    expect(
      formatTotalPurchaseSpendFromSnapshots([
        { quantity: 15, unitCostCp: 5000 },
        { quantity: 1, unitCostCp: undefined },
      ]),
    ).toBe('750 GP spent')
  })

  it('formats grant preview labels', () => {
    expect(formatGrantPreviewLine(1, 'common')).toBe('Common choice')
    expect(formatGrantPreviewLine(2, 'uncommon')).toBe('2 Uncommon choices')
    expect(formatUsesGrantPreviewLine(1, 'rare')).toBe('Uses 1 Rare choice')
    expect(formatUsesGrantPreviewLine(2, 'legendary')).toBe('Uses 2 Legendary choices')
  })
})
