import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, startingEquipmentChoiceSetId } from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
import {
  buildEquipmentInventoryViewModel,
  formatAddedEquipmentProvenanceLabel,
  formatEquipmentInventorySourceBreakdownLabel,
  groupEquipmentInventoryRowsForDisplay,
  resolveCombinedInventoryDetailLineLabel,
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
        grant: 0,
      }),
    ).toBe('7 total · 5 included · 2 purchased')
  })

  it('groups duplicate equipment ids into a combined display item', () => {
    const included = row({
      entry: {
        equipmentId: 'srd-cc-5.2.1:arrows',
        quantity: 5,
        sources: [
          { kind: 'classStartingEquipment', sourceId: 'class', grantId: 'standard-equipment' },
        ],
      },
      removeTarget: { kind: 'package', packageItemKey: 'class:standard-equipment:0' },
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
        sources: [
          { kind: 'classStartingEquipment', sourceId: 'class', grantId: 'standard-equipment' },
        ],
      },
      removeTarget: { kind: 'package', packageItemKey: 'class:standard-equipment:0' },
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

  it('uses purchase price lines for purchased-only combined rows', () => {
    const purchasedA = row({
      equipmentName: 'Leather Armor',
      entry: {
        equipmentId: equipmentStepLeatherArmorFixture.id,
        quantity: 1,
        sources: [{ kind: 'startingGold' }],
      },
      equipment: equipmentStepLeatherArmorFixture,
      sourceLabel: 'Purchased with starting gold',
      quantityMode: 'editable',
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      priceLineLabel: '2 GP',
    })
    const purchasedB = row({
      ...purchasedA,
      entry: { ...purchasedA.entry, quantity: 1 },
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-test-1' },
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-test-1' },
      priceLineLabel: '2 GP',
    })

    const combined = groupEquipmentInventoryRowsForDisplay([purchasedA, purchasedB])[0]
    expect(combined?.kind).toBe('combined')
    if (combined?.kind !== 'combined') return

    expect(resolveCombinedInventoryDetailLineLabel(combined)).toBe('10 GP each · 20 GP total')
  })

  it('formats added-equipment provenance across grant and purchase sources', () => {
    const grant = row({
      group: 'magicItems',
      groupLabel: 'Magic Items',
      entry: {
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
        quantity: 2,
        sources: [{ kind: 'startingWealthTier', sourceId: 'tier', grantId: 'allowance' }],
      },
      sourceLabel: 'Common choice',
      removeTarget: {
        kind: 'magicItemGrant',
        allowanceId: 'allowance',
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      },
    })
    const purchased = row({
      group: 'magicItems',
      groupLabel: 'Magic Items',
      entry: {
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
        quantity: 1,
        sources: [{ kind: 'startingGold' }],
      },
      equipment: equipmentStepLeatherArmorFixture,
      sourceLabel: 'Purchased with starting gold',
      quantityMode: 'editable',
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      removeLabel: 'Remove Potion of Healing',
    })

    expect(formatAddedEquipmentProvenanceLabel([grant, purchased])).toBe(
      '2 Common choices · Purchased · 10 GP',
    )
  })

  it('builds package and added equipment channels for monk standard equipment', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)

    expect(viewModel?.startingEquipment.kind).toBe('package')
    if (viewModel?.startingEquipment.kind !== 'package') return

    expect(viewModel.startingEquipment.group.optionLabel).toBe('Standard Equipment')
    expect(viewModel.startingEquipment.group.customize.status).toBe('available')
    expect(viewModel.addedEquipment.every((group) => group.entries.length === 0)).toBe(true)
  })

  it('uses gold-option starting channel instead of hiding the left column', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)).toEqual({
      startingEquipment: {
        kind: 'gold_option',
        message: 'Starting gold selected',
        description: 'Use the guidance above to purchase gear with your starting gold.',
      },
      addedEquipment: [],
    })
  })

  it('aggregates mixed-source magic items into one added-equipment entry', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: 'srd-cc-5.2.1:rations',
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
    const gearEntries = viewModel?.addedEquipment.find((group) => group.groupLabel === 'Gear')

    expect(viewModel?.startingEquipment.kind).toBe('package')
    expect(gearEntries?.entries).toHaveLength(1)
    expect(gearEntries?.entries[0]?.totalQuantity).toBe(2)
    expect(gearEntries?.entries[0]?.sources).toEqual([{ kind: 'startingGold', quantity: 2 }])
  })
})
