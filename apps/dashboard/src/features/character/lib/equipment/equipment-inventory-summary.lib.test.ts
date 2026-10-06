import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, startingEquipmentChoiceSetId } from '@rpg/contracts'
import { buildMagicItemAllowanceId, standardStartingWealthTableId } from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepDaggerFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
  equipmentStepRationsFixture,
  equipmentStepSpearFixture,
  createEquipmentStepContextWithMagicItemGrantsFixture,
} from './equipment-step.fixtures'
import type { EquipmentInventoryRow } from './equipment-step.lib'
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
      groupLabel: 'Magic items',
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
      groupLabel: 'Magic items',
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
    expect(
      formatAddedEquipmentProvenanceLabel([
        { ...grant, entry: { ...grant.entry, quantity: 1 } },
        { ...purchased, entry: { ...purchased.entry, quantity: 5 } },
      ]),
    ).toBe('Common choice · Purchased ×5 · 50 GP')
    expect(
      formatAddedEquipmentProvenanceLabel([{ ...grant, entry: { ...grant.entry, quantity: 1 } }]),
    ).toBe('Common choice')
    expect(
      formatAddedEquipmentProvenanceLabel([{ ...grant, entry: { ...grant.entry, quantity: 3 } }]),
    ).toBe('3 Common choices')
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
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)

    expect(viewModel?.layout === 'split' && viewModel.startingEquipment.kind).toBe('package')
    if (viewModel?.layout !== 'split' || viewModel.startingEquipment.kind !== 'package') return

    expect(viewModel.layout === 'split' && viewModel.startingEquipment.group.optionLabel).toBe(
      'Standard Equipment',
    )
    expect(viewModel.layout === 'split' && viewModel.startingEquipment.group.customize.status).toBe(
      'available',
    )
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
        editedSincePackageSelection: false,
      },
    }

    expect(buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)).toEqual({
      layout: 'split',
      startingEquipment: {
        kind: 'gold_option',
        optionLabel: 'Starting Gold',
      },
      addedEquipment: [],
    })
  })

  it('keeps the gold-option channel when magic item grants are available', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(
      draft,
      equipmentStepCatalogIndexFixture,
      undefined,
      'included',
      createEquipmentStepContextWithMagicItemGrantsFixture(),
    )

    expect(viewModel?.layout === 'split' && viewModel.startingEquipment).toEqual({
      kind: 'gold_option',
      optionLabel: 'Starting Gold',
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
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
    const gearEntries = viewModel?.addedEquipment.find((group) => group.groupLabel === 'Gear')

    expect(viewModel?.layout === 'split' && viewModel.startingEquipment.kind).toBe('package')
    expect(gearEntries?.entries).toHaveLength(1)
    expect(gearEntries?.entries[0]?.totalQuantity).toBe(2)
    expect(gearEntries?.entries[0]?.sources).toEqual([{ kind: 'startingGold', quantity: 2 }])
  })

  it('aggregates grant and purchased potions into one magic-items entry', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: standardStartingWealthTableId('srd-cc-5.2.1'),
      tierId: 'hero',
      rarity: 'common',
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepPotionOfHealingFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        magicItemSelections: [
          {
            allowanceId,
            equipmentId: equipmentStepPotionOfHealingFixture.id,
            quantity: 2,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    const context = createEquipmentStepContextWithMagicItemGrantsFixture()
    const viewModel = buildEquipmentInventoryViewModel(
      draft,
      equipmentStepCatalogIndexFixture,
      undefined,
      'included',
      context,
    )
    const magicItems = viewModel?.addedEquipment.find((group) => group.groupLabel === 'Magic items')

    expect(magicItems?.entries).toHaveLength(1)
    expect(magicItems?.entries[0]).toMatchObject({
      equipmentId: equipmentStepPotionOfHealingFixture.id,
      totalQuantity: 3,
      rows: expect.arrayContaining([
        expect.objectContaining({
          removeTarget: expect.objectContaining({ kind: 'magicItemGrant' }),
        }),
        expect.objectContaining({
          removeTarget: expect.objectContaining({ kind: 'purchase' }),
        }),
      ]),
    })
  })

  it('groups purchased weapons under the weapons category on the package path', () => {
    const catalogIndex = {
      ...equipmentStepCatalogIndexFixture,
      equipment: new Map([
        ...equipmentStepCatalogIndexFixture.equipment,
        [equipmentStepBattleaxeFixture.id, equipmentStepBattleaxeFixture],
      ]),
    }
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
            equipmentId: equipmentStepBattleaxeFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, catalogIndex)
    const weapons = viewModel?.addedEquipment.find((group) => group.groupLabel === 'Weapons')

    expect(viewModel?.layout === 'split' && viewModel.startingEquipment.kind).toBe('package')
    expect(weapons?.entries).toHaveLength(1)
    expect(weapons?.entries[0]?.equipmentName).toBe('Battleaxe')
  })
  it('uses the single-column pending layout when purchases are retained without an option', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepRationsFixture.id,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)

    expect(viewModel?.layout).toBe('pending')
    expect(viewModel?.addedEquipment.flatMap((group) => group.entries)).toHaveLength(1)
    expect(viewModel?.addedEquipment[0]?.entries[0]?.equipmentName).toBe('Rations')
    expect(viewModel?.addedEquipment[0]?.entries[0]?.otherSources).toEqual([])
    expect(viewModel?.addedEquipment[0]?.entries[0]?.otherSourceQuantity).toBe(0)
  })

  it('records package overlap on an added dagger purchase', () => {
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
            equipmentId: equipmentStepDaggerFixture.id,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        classPackage: {
          state: 'selected' as const,
          packageId: 'standard-equipment',
          intent: 'explicit' as const,
          overrides: { entryQuantities: { dagger: 2 } },
        },
        editedSincePackageSelection: false,
      },
    }

    const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
    const dagger = viewModel?.addedEquipment
      .flatMap((group) => group.entries)
      .find((entry) => entry.equipmentId === equipmentStepDaggerFixture.id)

    expect(dagger?.provenanceLabel).toBe('Package ×2 · Purchased · 4 GP')
    expect(dagger?.otherSourceQuantity).toBe(2)
    expect(dagger?.otherSources).toEqual([{ kind: 'package', quantity: 2 }])
    expect(dagger?.totalQuantity).toBe(2)
  })

  it('records an additional grant and omits an ensure grant the package covers', () => {
    const additionalDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepRationsFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        grants: [
          {
            equipmentId: equipmentStepRationsFixture.id,
            quantity: 1,
            contribution: 'additional' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }
    const additional = buildEquipmentInventoryViewModel(
      additionalDraft,
      equipmentStepCatalogIndexFixture,
    )
      ?.addedEquipment.flatMap((group) => group.entries)
      .find((entry) => entry.equipmentId === equipmentStepRationsFixture.id)

    expect(additional?.otherSources).toEqual([{ kind: 'grant', quantity: 1 }])
    expect(additional?.provenanceLabel.startsWith('Grant ×1')).toBe(true)

    const coveredDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepSpearFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        grants: [
          {
            equipmentId: equipmentStepSpearFixture.id,
            quantity: 1,
            contribution: 'ensure' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }
    const covered = buildEquipmentInventoryViewModel(coveredDraft, equipmentStepCatalogIndexFixture)
      ?.addedEquipment.flatMap((group) => group.entries)
      .find((entry) => entry.equipmentId === equipmentStepSpearFixture.id)

    expect(covered?.otherSources).toEqual([{ kind: 'package', quantity: 1 }])
    expect(covered?.provenanceLabel.includes('Grant')).toBe(false)
    expect(covered?.provenanceLabel.startsWith('Package ×1')).toBe(true)
  })

  it('produces no other sources on the gold path', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: equipmentStepDaggerFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        grants: [
          {
            equipmentId: equipmentStepDaggerFixture.id,
            quantity: 1,
            contribution: 'additional' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    const dagger = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
      ?.addedEquipment.flatMap((group) => group.entries)
      .find((entry) => entry.equipmentId === equipmentStepDaggerFixture.id)

    expect(dagger?.otherSources).toEqual([])
    expect(dagger?.otherSourceQuantity).toBe(0)
    expect(dagger?.provenanceLabel.includes('Grant')).toBe(false)
    expect(dagger?.provenanceLabel.includes('Package')).toBe(false)
  })
})
