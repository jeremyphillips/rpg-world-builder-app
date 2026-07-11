import { describe, expect, it } from 'vitest'

import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
import {
  formatEquipmentInventorySourceBreakdownLabel,
  groupEquipmentInventoryRowsForDisplay,
} from './equipment-inventory-summary.lib'

function row(
  args: Partial<EquipmentInventoryRow> & Pick<EquipmentInventoryRow, 'entry'>,
): EquipmentInventoryRow {
  return {
    group: 'gear',
    groupLabel: 'Gear',
    equipmentName: 'Arrows',
    sourceLabel: 'Included with Standard Equipment',
    isStackable: true,
    quantityMode: 'locked',
    removeLabel: 'Remove Arrows',
    ...args,
  }
}

describe('equipment-inventory-summary.lib', () => {
  it('formats combined source breakdown labels', () => {
    expect(
      formatEquipmentInventorySourceBreakdownLabel({
        included: 5,
        purchased: 2,
        manual: 0,
      }),
    ).toBe('7 total · 5 included · 2 purchased')
  })

  it('groups duplicate equipment ids into a combined display item', () => {
    const included = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:arrows',
        quantity: 5,
        sources: [{ kind: 'classStartingEquipment', sourceId: 'class', grantId: 'standard' }],
      },
      removeTarget: { kind: 'package', packageItemKey: 'class:standard:0' },
    })
    const purchased = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:arrows',
        quantity: 2,
        sources: [{ kind: 'startingGold' }],
      },
      sourceLabel: 'Purchased with starting gold',
      quantityMode: 'editable',
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      removeLabel: 'Remove all 2 Arrows',
    })

    expect(groupEquipmentInventoryRowsForDisplay([included, purchased])).toEqual([
      {
        kind: 'combined',
        group: 'gear',
        equipmentId: 'srd-cc-5.2.1:arrows',
        equipmentName: 'Arrows',
        totalQuantity: 7,
        breakdownLabel: '7 total · 5 included · 2 purchased',
        rows: [included, purchased],
      },
    ])
  })
})
