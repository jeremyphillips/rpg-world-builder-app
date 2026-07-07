import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  resolveStartingEquipmentOptionSummaries,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  buildEquipmentAddPurchasePatch,
  buildEquipmentRemoveEntryPatch,
  buildEquipmentSelectionPatch,
  buildEquipmentSetPurchaseQuantityPatch,
  formatEquipmentSourceLabel,
  formatStartingEquipmentOptionMeta,
  hasSelectableStartingEquipmentOption,
  isStartingGoldOptionId,
  isUniqueEquipmentOwnedInDraft,
  listEquipmentInventoryRowsFromDraft,
  resolvePurchaseSourceMode,
  shouldShowEquipmentFallback,
} from './equipment-step.lib'
import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepLeatherArmorFixture,
} from './equipment-step.fixtures'

describe('equipment-step.lib', () => {
  it('detects gold options', () => {
    expect(isStartingGoldOptionId('gold')).toBe(true)
    expect(isStartingGoldOptionId('standard')).toBe(false)
  })

  it('builds package and gold selection patches', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const classId = equipmentStepBardClassFixture.id
    const choiceSetId = startingEquipmentChoiceSetId(classId)

    const packagePatch = buildEquipmentSelectionPatch({
      draft,
      classId,
      optionId: 'standard',
      choiceSetId,
      nestedSelections: {},
    })

    expect(packagePatch.choiceSelections?.[choiceSetId]).toEqual(['standard'])
    expect(packagePatch.equipment?.mode).toBe('package')

    const goldPatch = buildEquipmentSelectionPatch({
      draft,
      classId,
      optionId: 'gold',
      choiceSetId,
      nestedSelections: {},
    })

    expect(goldPatch.equipment?.mode).toBe('gold')
  })

  it('formats equipment source labels', () => {
    expect(
      formatEquipmentSourceLabel(
        [
          {
            kind: 'classStartingEquipment',
            sourceId: equipmentStepBardClassFixture.id,
            grantId: 'standard',
          },
        ],
        equipmentStepCatalogIndexFixture,
      ),
    ).toBe('From Bard starting equipment')

    expect(
      formatEquipmentSourceLabel([{ kind: 'startingGold' }], equipmentStepCatalogIndexFixture),
    ).toBe('Purchased with starting gold')
  })

  it('builds purchase and removal patches', () => {
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

    const addPatch = buildEquipmentAddPurchasePatch({
      draft,
      catalogIndex: equipmentStepCatalogIndexFixture,
      equipmentId: 'srd-cc-5.2.1:leather-armor',
      sourceMode: resolvePurchaseSourceMode('gold'),
    })

    expect(addPatch?.equipment?.purchases).toEqual([
      {
        equipmentId: 'srd-cc-5.2.1:leather-armor',
        quantity: 1,
        sourceMode: 'startingGold',
      },
    ])

    const duplicatePatch = buildEquipmentAddPurchasePatch({
      draft: { ...draft, equipment: addPatch?.equipment },
      catalogIndex: equipmentStepCatalogIndexFixture,
      equipmentId: 'srd-cc-5.2.1:leather-armor',
      sourceMode: resolvePurchaseSourceMode('gold'),
    })

    expect(duplicatePatch).toBeUndefined()

    const withPurchase = {
      ...draft,
      equipment: addPatch?.equipment,
    }

    const removePatch = buildEquipmentRemoveEntryPatch({
      draft: withPurchase,
      target: { kind: 'purchase', purchaseIndex: 0 },
    })

    expect(removePatch.equipment?.purchases).toEqual([])
  })

  it('stacks consumable purchases and updates quantity with budget-aware patches', () => {
    const rationsId = 'srd-cc-5.2.1:rations'
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

    const catalogIndex = {
      ...equipmentStepCatalogIndexFixture,
      equipment: new Map([
        ...equipmentStepCatalogIndexFixture.equipment,
        [
          rationsId,
          {
            id: rationsId,
            slug: 'rations',
            rulesetId: 'srd-cc-5.2.1',
            source: 'system',
            campaignId: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            name: 'Rations',
            description: '',
            kind: 'adventuring_gear',
            gearKind: 'consumable',
            cost: { amount: 5, currency: 'sp' },
            weight: { value: 2, unit: 'lb' },
          },
        ],
      ]),
    }

    const addPatch = buildEquipmentAddPurchasePatch({
      draft,
      catalogIndex,
      equipmentId: rationsId,
      sourceMode: 'startingGold',
      quantity: 2,
    })

    expect(addPatch?.equipment?.purchases).toEqual([
      { equipmentId: rationsId, quantity: 2, sourceMode: 'startingGold' },
    ])

    const quantityPatch = buildEquipmentSetPurchaseQuantityPatch({
      draft: { ...draft, equipment: addPatch?.equipment },
      catalogIndex,
      purchaseIndex: 0,
      quantity: 4,
    })

    expect(quantityPatch?.equipment?.purchases).toEqual([
      { equipmentId: rationsId, quantity: 4, sourceMode: 'startingGold' },
    ])
  })

  it('detects unique equipment already owned in draft inventory', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(
      isUniqueEquipmentOwnedInDraft(
        draft,
        equipmentStepCatalogIndexFixture,
        equipmentStepLeatherArmorFixture.id,
      ),
    ).toBe(true)
  })

  it('lists removable inventory rows from draft decisions', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const rows = listEquipmentInventoryRowsFromDraft(draft, equipmentStepCatalogIndexFixture)

    expect(rows).toHaveLength(1)
    expect(rows[0]?.removeTarget).toEqual({
      kind: 'package',
      packageItemKey: `${equipmentStepBardClassFixture.id}:standard:0`,
    })
  })
})

describe('starting equipment fallback helpers', () => {
  it('shows fallback only when every package is unselectable and gold is absent', () => {
    const selectable = [
      {
        optionId: 'standard',
        label: 'Standard',
        itemsByGroup: {
          weapons: [],
          armor: [],
          tools: [],
          gear: [],
          magicItems: [],
          vehicles: [],
          mounts: [],
        },
        missingItemSlugs: [],
        unselectableReasons: [],
        isSelectable: true,
      },
    ]

    expect(hasSelectableStartingEquipmentOption(selectable)).toBe(true)
    expect(shouldShowEquipmentFallback(selectable)).toBe(false)

    const broken = [
      {
        optionId: 'broken',
        label: 'Broken',
        itemsByGroup: {
          weapons: [],
          armor: [],
          tools: [],
          gear: [],
          magicItems: [],
          vehicles: [],
          mounts: [],
        },
        missingItemSlugs: ['cloak'],
        unselectableReasons: ['cloak: Missing from catalog'],
        isSelectable: false,
      },
    ]

    expect(shouldShowEquipmentFallback(broken)).toBe(true)
  })

  it('formats option meta from resolved summaries', () => {
    const summaries = resolveStartingEquipmentOptionSummaries(
      equipmentStepBardClassFixture,
      equipmentStepCatalogIndexFixture,
    )
    const standard = summaries.find((summary) => summary.optionId === 'standard')!

    expect(formatStartingEquipmentOptionMeta(standard)).toEqual(
      expect.arrayContaining(['Leather Armor (equipped)', '1× Musical Instrument', '19 GP']),
    )
  })
})
