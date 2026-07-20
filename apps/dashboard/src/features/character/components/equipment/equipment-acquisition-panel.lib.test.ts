import { describe, expect, it } from 'vitest'

import {
  formatAcquisitionCommitLabel,
  formatAcquisitionSuccessMessage,
  formatTotalPurchaseSpendFromSnapshots,
} from './equipment-acquisition-panel.lib'

describe('equipment-acquisition-panel.lib', () => {
  it('formats commit labels for grant-only and multi-quantity adds', () => {
    expect(
      formatAcquisitionCommitLabel({
        plan: {
          requestedQuantity: 1,
          fulfilledQuantity: 1,
          unfulfilledQuantity: 0,
          grantAllocations: [{ allowanceId: 'allowance-common', quantity: 1 }],
          purchaseQuantity: 0,
          totalCostCp: 0,
          canApplyRequestedQuantity: true,
          blockers: [],
        },
        quantity: 1,
      }),
    ).toBe('Use magic item choice')

    expect(
      formatAcquisitionCommitLabel({
        plan: {
          requestedQuantity: 3,
          fulfilledQuantity: 3,
          unfulfilledQuantity: 0,
          grantAllocations: [],
          purchaseQuantity: 3,
          totalCostCp: 15000,
          canApplyRequestedQuantity: true,
          blockers: [],
        },
        quantity: 3,
      }),
    ).toBe('Add 3 to inventory')
  })

  it('sums snapshot-based GP spent labels', () => {
    expect(
      formatTotalPurchaseSpendFromSnapshots([
        { purchaseId: 'purchase-1', quantity: 15, unitCostCp: 5000 },
      ]),
    ).toBe('750 GP spent')
  })

  it('formats success messages for live-region announcements', () => {
    expect(formatAcquisitionSuccessMessage(3)).toBe('Added 3 to inventory')
  })
})
