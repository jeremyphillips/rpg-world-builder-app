import { describe, expect, it } from 'vitest'

import {
  buildEquipmentPickerRowActionViewModel,
  formatAcquisitionBlockerNote,
  formatPartialActionLabel,
} from './equipment-picker-action.lib'

describe('equipment-picker-action.lib', () => {
  it('maps purchase unavailability to disabled row state', () => {
    const vm = buildEquipmentPickerRowActionViewModel({
      kind: 'purchase',
      availability: { status: 'unavailable', reason: 'no_market_price' },
    })

    expect(vm).toMatchObject({
      kind: 'purchase',
      disabled: true,
      disabledNote: 'Not for sale',
    })
  })

  it('keeps add blocker copy in the grant panel only', () => {
    const vm = buildEquipmentPickerRowActionViewModel({
      kind: 'magic_item_grant',
      eligibility: { eligible: false, reason: 'allowance_full' },
      quantityBounds: { maxAdditionalQuantity: 0 },
      plan: {
        requestedQuantity: 1,
        fulfilledQuantity: 0,
        unfulfilledQuantity: 1,
        grantAllocations: [],
        purchaseQuantity: 0,
        totalCostCp: 0,
        canApplyRequestedQuantity: false,
        blockers: [{ code: 'duplicate_not_allowed' }],
      },
      capabilities: {
        canExpand: true,
        canAdd: false,
        canManage: true,
        addBlockedReason: { code: 'duplicate_not_allowed' },
      },
    })

    expect(vm.kind).toBe('magic_item_grant')
    if (vm.kind !== 'magic_item_grant') return

    expect(vm.disabled).toBe(false)
    expect(vm.disabledNote).toBeUndefined()
    expect(vm.addBlockedNote).toContain('maximum allowed copies')
  })

  it('formats mixed partial labels as available', () => {
    expect(
      formatPartialActionLabel({
        requestedQuantity: 2,
        grantQuantity: 1,
        purchaseQuantity: 1,
        totalCostCp: 5000,
      }),
    ).toBe('Add 2 available')
  })

  it('formats grant-only partial labels', () => {
    expect(
      formatPartialActionLabel({
        requestedQuantity: 1,
        grantQuantity: 1,
        purchaseQuantity: 0,
        totalCostCp: 0,
      }),
    ).toBe('Add 1 with grant')
  })

  it('maps each acquisition blocker code to distinct copy', () => {
    expect(formatAcquisitionBlockerNote({ code: 'duplicate_not_allowed' })).toContain('maximum')
    expect(formatAcquisitionBlockerNote({ code: 'no_matching_grant' })).toContain('allowance')
    expect(formatAcquisitionBlockerNote({ code: 'no_market_price' })).toBe('Not for sale')
    expect(formatAcquisitionBlockerNote({ code: 'cannot_afford', shortfallCp: 100 })).toBe(
      'Cannot afford',
    )
  })
})
