import { describe, expect, it } from 'vitest'

import { equipmentStepLeatherArmorFixture } from '../../../lib/equipment/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../../lib/equipment/equipment-step.lib'
import {
  formatGrantManageSourceLabel,
  formatTotalPurchaseSpendFromSnapshots,
  grantedQuantity,
  resolveDistinctAcquisitionSourceKinds,
  resolveEquipmentInventoryManageSources,
  resolveEquipmentInventoryRowManagementMode,
  usesInlineManagement,
  usesMixedSourceManagement,
} from './equipment-inventory-manage.lib'

function row(
  args: Partial<EquipmentInventoryRow> & Pick<EquipmentInventoryRow, 'entry'>,
): EquipmentInventoryRow {
  return {
    group: 'gear',
    groupLabel: 'Gear',
    equipmentName: 'Test Item',
    sourceLabel: 'Purchased with starting gold',
    isStackable: true,
    quantityMode: 'locked',
    removeLabel: 'Remove Test Item',
    ...args,
  }
}

describe('equipment-inventory-manage.lib', () => {
  it('detects mixed acquisition sources from row remove targets', () => {
    const grant = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
        quantity: 1,
        sources: [{ kind: 'startingWealthTier', sourceId: 'tier', grantId: 'allowance' }],
      },
      group: 'magicItems',
      groupLabel: 'Magic Items',
      sourceLabel: 'Common choice',
      removeTarget: {
        kind: 'magicItemGrant',
        allowanceId: 'allowance-common',
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      },
    })
    const purchase = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:arrows',
        quantity: 1,
        sources: [{ kind: 'startingGold' }],
      },
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
    })

    expect(resolveDistinctAcquisitionSourceKinds([grant, purchase])).toEqual([
      'magicItemGrant',
      'purchase',
    ])
    expect(usesMixedSourceManagement([grant, purchase])).toBe(true)
    expect(
      usesInlineManagement({
        sourceKinds: resolveDistinctAcquisitionSourceKinds([grant, purchase]),
        grantedQuantity: grantedQuantity([grant, purchase]),
      }),
    ).toBe(true)
    expect(
      usesMixedSourceManagement([
        purchase,
        {
          ...purchase,
          removeTarget: { kind: 'purchase', purchaseId: 'purchase-2' },
        },
      ]),
    ).toBe(false)
  })

  it('resolves row management modes for purchase, grant, and mixed entries', () => {
    const purchase = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:arrows',
        quantity: 1,
        sources: [{ kind: 'startingGold' }],
      },
      quantityMode: 'editable',
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
    })
    const grant = row({
      group: 'magicItems',
      groupLabel: 'Magic Items',
      sourceLabel: 'Common choice',
      entry: { equipmentId: 'potion', quantity: 2, sources: [] },
      removeTarget: {
        kind: 'magicItemGrant',
        allowanceId: 'allowance-common',
        equipmentId: 'potion',
      },
    })
    const singleGrant = row({
      group: 'magicItems',
      groupLabel: 'Magic Items',
      sourceLabel: 'Common choice',
      entry: { equipmentId: 'potion', quantity: 1, sources: [] },
      removeTarget: {
        kind: 'magicItemGrant',
        allowanceId: 'allowance-common',
        equipmentId: 'potion',
      },
    })

    expect(resolveEquipmentInventoryRowManagementMode([purchase])).toEqual({
      kind: 'purchase_only',
    })
    expect(resolveEquipmentInventoryRowManagementMode([singleGrant])).toEqual({
      kind: 'purchase_only',
    })
    expect(resolveEquipmentInventoryRowManagementMode([grant])).toEqual({
      kind: 'inline',
      totalQuantity: 2,
    })
    expect(resolveEquipmentInventoryRowManagementMode([grant, purchase])).toEqual({
      kind: 'inline',
      totalQuantity: 3,
    })
  })

  it('formats grant manage labels and purchase totals for the manage panel', () => {
    expect(formatGrantManageSourceLabel('Common choice')).toBe('Common choices')

    const sources = resolveEquipmentInventoryManageSources([
      row({
        group: 'magicItems',
        groupLabel: 'Magic Items',
        sourceLabel: 'Common choice',
        entry: { equipmentId: 'potion', quantity: 2, sources: [] },
        removeTarget: {
          kind: 'magicItemGrant',
          allowanceId: 'allowance-common',
          equipmentId: 'potion',
        },
      }),
      row({
        equipment: equipmentStepLeatherArmorFixture,
        entry: { equipmentId: equipmentStepLeatherArmorFixture.id, quantity: 1, sources: [] },
        removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
      }),
    ])

    expect(sources.grants[0]).toMatchObject({
      label: 'Common choices',
      quantity: 2,
    })
    expect(sources.purchases[0]).toMatchObject({
      label: 'Purchased',
      quantity: 1,
      totalPriceLabel: '10 GP',
    })
  })

  it('sums purchase spend from stored unit cost snapshots', () => {
    expect(
      formatTotalPurchaseSpendFromSnapshots([
        { quantity: 15, unitCostCp: 5000 },
        { quantity: 1, unitCostCp: undefined },
      ]),
    ).toBe('750 GP spent')
  })
})
