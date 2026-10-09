import { describe, expect, it } from 'vitest'

import { EMPTY_EQUIPMENT_OWNERSHIP } from '../../../../lib/equipment/equipment-ownership-index.lib'
import { buildEquipmentPickerInventorySummaryRows } from './equipment-picker-inventory-summary.lib'

describe('buildEquipmentPickerInventorySummaryRows', () => {
  it('lists only the buckets that contributed, in provenance order', () => {
    const { rows, total } = buildEquipmentPickerInventorySummaryRows({
      ...EMPTY_EQUIPMENT_OWNERSHIP,
      packageQuantity: 1,
      choices: [{ allowanceId: 'a1', rarity: 'uncommon', requirement: 'up_to', quantity: 1 }],
      lockedPurchased: { quantity: 1, spendCp: 500 },
      editablePurchased: { quantity: 2, spendCp: 1000 },
      grantQuantity: 1,
      totalQuantity: 6,
    })

    expect(rows).toEqual([
      { label: 'Package', value: '×1' },
      { label: 'Up to Uncommon choice', value: '×1' },
      { label: 'Converted from package', value: '×1 · 5 GP' },
      { label: 'Purchased', value: '×2 · 10 GP' },
      { label: 'Grant', value: '×1' },
    ])
    expect(total).toEqual({ label: 'Total owned', value: '×6' })
  })

  it('omits the spend segment for purchases with no recorded cost', () => {
    const { rows } = buildEquipmentPickerInventorySummaryRows({
      ...EMPTY_EQUIPMENT_OWNERSHIP,
      editablePurchased: { quantity: 2, spendCp: 0 },
      totalQuantity: 2,
    })

    expect(rows).toEqual([{ label: 'Purchased', value: '×2' }])
  })
})
