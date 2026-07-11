import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  buildChoiceSetId,
  createDeterministicLegacyPurchaseId,
  resolveStartingEquipmentOptionSummaries,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  buildEquipmentAddPurchasePatch,
  buildEquipmentRemoveEntryPatch,
  buildEquipmentSelectionPatch,
  buildEquipmentSetPurchaseQuantityPatch,
  formatEquipmentInventoryRemoveLabel,
  formatEquipmentSourceLabel,
  formatStartingEquipmentOptionMeta,
  hasSelectableStartingEquipmentOption,
  isStartingGoldOptionId,
  isUniqueEquipmentOwnedInDraft,
  listEquipmentInventoryRowsFromDraft,
  listProficiencyLinksForOption,
  resolvePurchaseSourceMode,
  shouldShowEquipmentFallback,
  shouldShowEquipmentShopping,
} from './equipment-step.lib'
import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepDaggerFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
} from './equipment-step.fixtures'

describe('equipment-step.lib', () => {
  it('detects gold options', () => {
    expect(isStartingGoldOptionId('gold')).toBe(true)
    expect(isStartingGoldOptionId('standard')).toBe(false)
  })

  it('shows equipment shopping only on the gold path', () => {
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
      shouldShowEquipmentShopping(
        draft,
        draft.choiceSelections[startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]?.[0],
      ),
    ).toBe(false)

    const goldDraft = {
      ...draft,
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: { ...draft.equipment, mode: 'gold' as const },
    }

    expect(
      shouldShowEquipmentShopping(
        goldDraft,
        goldDraft.choiceSelections[
          startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)
        ]?.[0],
      ),
    ).toBe(true)
  })

  it('resolves purchase source mode to starting gold only', () => {
    expect(resolvePurchaseSourceMode()).toBe('startingGold')
  })

  it('does not create manual purchases from the picker path', () => {
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

    expect(
      buildEquipmentAddPurchasePatch({
        draft,
        catalogIndex: equipmentStepCatalogIndexFixture,
        equipmentId: equipmentStepLeatherArmorFixture.id,
        sourceMode: 'manual',
      }),
    ).toBeUndefined()
  })

  it('does not write removedPackageItemKeys when removing package rows from inventory', () => {
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

    const patch = buildEquipmentRemoveEntryPatch({
      draft,
      target: {
        kind: 'package',
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard:0`,
      },
    })

    expect(patch.equipment?.removedPackageItemKeys).toEqual([])
    expect(patch.equipment?.customized).toBe(false)
  })

  it('still hides legacy removed package items from inventory rows', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [`${equipmentStepBardClassFixture.id}:standard:0`],
        customized: true,
      },
    }

    const rows = listEquipmentInventoryRowsFromDraft(draft, equipmentStepCatalogIndexFixture)

    expect(rows).toHaveLength(0)
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
      sourceMode: resolvePurchaseSourceMode(),
    })

    expect(addPatch?.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: 'srd-cc-5.2.1:leather-armor',
        quantity: 1,
        sourceMode: 'startingGold',
        origin: 'picker',
        id: expect.any(String),
      }),
    ])

    const duplicatePatch = buildEquipmentAddPurchasePatch({
      draft: { ...draft, equipment: addPatch?.equipment },
      catalogIndex: equipmentStepCatalogIndexFixture,
      equipmentId: 'srd-cc-5.2.1:leather-armor',
      sourceMode: resolvePurchaseSourceMode(),
    })

    expect(duplicatePatch).toBeUndefined()

    const withPurchase = {
      ...draft,
      equipment: addPatch?.equipment,
    }
    const purchaseId = withPurchase.equipment!.purchases[0]!.id!

    const removePatch = buildEquipmentRemoveEntryPatch({
      draft: withPurchase,
      target: { kind: 'purchase', purchaseId },
    })

    expect(removePatch.equipment?.purchases).toEqual([])
  })

  it('removes the entire stackable purchase row instead of decrementing', () => {
    const rationsId = 'srd-cc-5.2.1:rations'
    const classId = equipmentStepBardClassFixture.id
    const purchaseId = createDeterministicLegacyPurchaseId({
      equipmentId: rationsId,
      sourceMode: 'startingGold',
      occurrenceIndex: 0,
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classId)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rationsId,
            quantity: 4,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const removePatch = buildEquipmentRemoveEntryPatch({
      draft,
      target: { kind: 'purchase', purchaseId },
    })

    expect(removePatch.equipment?.purchases).toEqual([])
  })

  it('does not remove stackable purchases when quantity drops below one', () => {
    const rationsId = 'srd-cc-5.2.1:rations'
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rationsId,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
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

    expect(
      buildEquipmentSetPurchaseQuantityPatch({
        draft,
        catalogIndex,
        purchaseId: createDeterministicLegacyPurchaseId({
          equipmentId: rationsId,
          sourceMode: 'startingGold',
          occurrenceIndex: 0,
        }),
        quantity: 0,
      }),
    ).toBeUndefined()
  })

  it('formats remove labels for single and stacked rows', () => {
    expect(formatEquipmentInventoryRemoveLabel('Rations', 1)).toBe('Remove Rations')
    expect(formatEquipmentInventoryRemoveLabel('Rations', 4)).toBe('Remove all 4 Rations')
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
      expect.objectContaining({
        equipmentId: rationsId,
        quantity: 2,
        sourceMode: 'startingGold',
        origin: 'picker',
        id: expect.any(String),
      }),
    ])

    const purchaseId = addPatch!.equipment!.purchases[0]!.id!
    const quantityPatch = buildEquipmentSetPurchaseQuantityPatch({
      draft: { ...draft, equipment: addPatch?.equipment },
      catalogIndex,
      purchaseId,
      quantity: 4,
    })

    expect(quantityPatch?.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: rationsId,
        quantity: 4,
        sourceMode: 'startingGold',
        origin: 'picker',
        id: purchaseId,
      }),
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
    expect(rows[0]?.quantityMode).toBe('locked')
  })

  it('lists proficiency links for monk standard package', () => {
    const option = equipmentStepMonkClassFixture.characterCreation!.startingEquipment!.options[0]!

    expect(listProficiencyLinksForOption(equipmentStepMonkClassFixture, option)).toEqual([
      {
        itemIndex: 2,
        choiceId: 'class-tools',
        choiceSetId: `class:${equipmentStepMonkClassFixture.id}:class-tools`,
      },
    ])
  })

  it('locks fixed grant quantities and keeps nested choice results at quantity one', () => {
    const monkToolChoiceSetId = buildChoiceSetId(
      'class',
      equipmentStepMonkClassFixture.id,
      'class-tools',
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const rows = listEquipmentInventoryRowsFromDraft(draft, equipmentStepCatalogIndexFixture)
    const daggerRow = rows.find((row) => row.entry.equipmentId === equipmentStepDaggerFixture.id)
    const luteRow = rows.find((row) => row.equipmentName === equipmentStepLuteFixture.name)

    expect(daggerRow).toEqual(
      expect.objectContaining({
        entry: expect.objectContaining({ quantity: 5 }),
        quantityMode: 'locked',
        sourceLabel: '5 included with Standard Equipment',
      }),
    )
    expect(luteRow).toEqual(
      expect.objectContaining({
        entry: expect.objectContaining({ quantity: 1 }),
        quantityMode: 'locked',
      }),
    )
  })
})

describe('equipment purchase quantity regressions', () => {
  it('preserves stack increment, full-stack remove, and non-stackable duplicate blocking', () => {
    const rationsId = 'srd-cc-5.2.1:rations'
    const classId = equipmentStepBardClassFixture.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classId)]: ['gold'],
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
    const purchaseId = addPatch!.equipment!.purchases[0]!.id!

    const incremented = buildEquipmentSetPurchaseQuantityPatch({
      draft: { ...draft, equipment: addPatch?.equipment },
      catalogIndex,
      purchaseId,
      quantity: 3,
    })
    expect(incremented?.equipment?.purchases[0]?.quantity).toBe(3)

    const removed = buildEquipmentRemoveEntryPatch({
      draft: { ...draft, equipment: incremented?.equipment },
      target: { kind: 'purchase', purchaseId },
    })
    expect(removed.equipment?.purchases).toEqual([])

    const armorPatch = buildEquipmentAddPurchasePatch({
      draft,
      catalogIndex,
      equipmentId: equipmentStepLeatherArmorFixture.id,
      sourceMode: 'startingGold',
    })
    expect(armorPatch?.equipment?.purchases).toHaveLength(1)

    const duplicateArmor = buildEquipmentAddPurchasePatch({
      draft: { ...draft, equipment: armorPatch?.equipment },
      catalogIndex,
      equipmentId: equipmentStepLeatherArmorFixture.id,
      sourceMode: 'startingGold',
    })
    expect(duplicateArmor).toBeUndefined()
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
