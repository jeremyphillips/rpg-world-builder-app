import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, startingEquipmentChoiceSetId } from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
import {
  buildEquipmentInventoryLayout,
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

  it('does not combine rows when allowCombinedRows is false', () => {
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

    expect(
      groupEquipmentInventoryRowsForDisplay([included, purchased], { allowCombinedRows: false }),
    ).toEqual([
      { kind: 'single', row: included },
      { kind: 'single', row: purchased },
    ])
  })

  it('builds package and purchased sections for monk standard equipment', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const layout = buildEquipmentInventoryLayout(draft, equipmentStepCatalogIndexFixture)

    expect(layout?.mode).toBe('package')
    if (layout?.mode !== 'package') return

    expect(layout.startingPackage.optionLabel).toBe('Standard Equipment')
    expect(layout.startingPackage.customize.status).toBe('available')
    expect(layout.purchased.every((group) => group.displays.length === 0)).toBe(true)
  })

  it('hides package section on gold path', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(buildEquipmentInventoryLayout(draft, equipmentStepCatalogIndexFixture)).toEqual({
      mode: 'gold',
      purchased: [],
    })
  })
})
