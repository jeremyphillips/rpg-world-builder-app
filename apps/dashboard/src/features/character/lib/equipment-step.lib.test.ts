import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  buildChoiceSetId,
  createDeterministicLegacyPurchaseId,
  defaultCampaignMechanicsPatch,
  DEFAULT_ABILITY_GENERATION_RULES,
  deriveEquipmentBudgetSummary,
  resolveCharacterCreationPatch,
  resolveStartingEquipmentOptionSummaries,
  startingEquipmentChoiceSetId,
  wealthToCopper,
  type CharacterBuildContext,
  type StartingWealthRules,
} from '@rpg/contracts'

import {
  buildEquipmentAddPurchasePatch,
  buildEquipmentRemoveEntryPatch,
  buildEquipmentSelectionPatch,
  buildEquipmentSetPurchaseQuantityPatch,
  formatEquipmentInventoryRemoveLabel,
  formatEquipmentSourceLabel,
  hasSelectableStartingEquipmentOption,
  isSelectedStartingEquipmentReady,
  isUniqueEquipmentOwnedInDraft,
  listEquipmentInventoryRowsFromDraft,
  listProficiencyLinksForOption,
  resolveEquipmentStepBudget,
  resolveEquipmentStepPickerItems,
  resolvePurchaseSourceMode,
  shouldShowEquipmentFallback,
  shouldShowEquipmentBudget,
  shouldShowEquipmentShopping,
} from './equipment-step.lib'
import {
  equipmentStepBardClassFixture,
  equipmentStepBreastplateFixture,
  equipmentStepCatalogFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepDaggerFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
} from './equipment-step.fixtures'

const tierBonusStartingWealthFixture: StartingWealthRules = {
  name: 'Tier bonus test wealth',
  scope: { kind: 'standard' },
  tiers: [
    {
      id: 'tier-5-plus',
      label: 'Levels 5–20',
      minLevel: 5,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      magicItemGrants: [],
      bonusGold: {
        baseGp: 500,
        formula: {
          kind: 'dice',
          dice: { count: 1, faces: 10 },
          multiplier: 25,
          currency: 'gp',
        },
      },
    },
  ],
}

function createEquipmentStepContextWithStartingWealth(
  startingWealth: StartingWealthRules,
): CharacterBuildContext {
  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId: equipmentStepBardClassFixture.rulesetId },
    rulesScope: { type: 'ruleset', rulesetId: equipmentStepBardClassFixture.rulesetId },
    ownershipTarget: { type: 'user' },
    rulesetId: equipmentStepBardClassFixture.rulesetId,
    catalog: equipmentStepCatalogFixture,
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, startingWealth),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
  }
}

describe('equipment-step.lib', () => {
  it('enables shopping for a homebrew wealth-only option id via option shape', () => {
    const homebrewClass = {
      ...equipmentStepBardClassFixture,
      characterCreation: {
        ...equipmentStepBardClassFixture.characterCreation!,
        startingEquipment: {
          choose: 1 as const,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items:
                equipmentStepBardClassFixture.characterCreation!.startingEquipment!.options[0]!
                  .items,
              wealth: { gp: 15 },
            },
            {
              id: 'buy-your-own-gear',
              label: 'Buy Your Own Gear',
              items: [],
              wealth: { gp: 75 },
            },
          ],
        },
      },
    }

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: homebrewClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(homebrewClass.id)]: ['buy-your-own-gear'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const patch = buildEquipmentSelectionPatch({
      draft: { ...draft, equipment: { ...draft.equipment, mode: 'package' } },
      classId: homebrewClass.id,
      optionId: 'buy-your-own-gear',
      choiceSetId: startingEquipmentChoiceSetId(homebrewClass.id),
      nestedSelections: {},
      characterClass: homebrewClass,
    })

    expect(patch.equipment?.mode).toBe('gold')
    expect(shouldShowEquipmentShopping(draft, 'buy-your-own-gear', homebrewClass)).toBe(true)
  })

  it('aligns picker affordability with the same campaign tier bonus budget as the drawer', () => {
    const context = createEquipmentStepContextWithStartingWealth(tierBonusStartingWealthFixture)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 5 as const },
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

    const budget = resolveEquipmentStepBudget(draft, equipmentStepCatalogIndexFixture, context)
    expect(budget).toBeDefined()
    expect(wealthToCopper(budget!.starting)).toBeGreaterThan(
      wealthToCopper({ gp: 90, sp: 0, cp: 0, pp: 0 }),
    )

    const { items } = resolveEquipmentStepPickerItems({
      draft,
      characterClass: equipmentStepBardClassFixture,
      catalogIndex: equipmentStepCatalogIndexFixture,
      choiceSets: [],
      budget,
    })

    const breastplate = items.find(
      (item) => item.equipment.id === equipmentStepBreastplateFixture.id,
    )
    expect(breastplate?.state.isWithinRemainingBudget).toBe(true)

    const budgetWithoutTierBonus = deriveEquipmentBudgetSummary(
      draft,
      equipmentStepCatalogIndexFixture,
    )
    const { items: itemsWithoutTierBonus } = resolveEquipmentStepPickerItems({
      draft,
      characterClass: equipmentStepBardClassFixture,
      catalogIndex: equipmentStepCatalogIndexFixture,
      choiceSets: [],
      budget: budgetWithoutTierBonus,
    })
    expect(
      itemsWithoutTierBonus.find((item) => item.equipment.id === equipmentStepBreastplateFixture.id)
        ?.state.isWithinRemainingBudget,
    ).toBe(false)
  })

  it('shows equipment shopping only on the gold path', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
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
        equipmentStepBardClassFixture,
      ),
    ).toBe(false)

    const goldDraft = {
      ...draft,
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: { ...draft.equipment, mode: 'gold' as const },
    }

    expect(
      shouldShowEquipmentShopping(
        goldDraft,
        goldDraft.choiceSelections[
          startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)
        ]?.[0],
        equipmentStepBardClassFixture,
      ),
    ).toBe(true)
  })

  it('shows equipment budget on any selected starting equipment option', () => {
    const packageDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(
      shouldShowEquipmentBudget(
        packageDraft,
        packageDraft.choiceSelections[
          startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)
        ]?.[0],
      ),
    ).toBe(true)

    expect(shouldShowEquipmentBudget(packageDraft, undefined)).toBe(false)
  })

  it('resolves purchase source mode to starting gold only', () => {
    expect(resolvePurchaseSourceMode()).toBe('startingGold')
  })

  it('does not create manual purchases from the picker path', () => {
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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
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
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard-equipment:0`,
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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [`${equipmentStepBardClassFixture.id}:standard-equipment:0`],
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
      optionId: 'standard-equipment',
      choiceSetId,
      nestedSelections: {},
      characterClass: equipmentStepBardClassFixture,
    })

    expect(packagePatch.choiceSelections?.[choiceSetId]).toEqual(['standard-equipment'])
    expect(packagePatch.equipment?.mode).toBe('package')

    const goldPatch = buildEquipmentSelectionPatch({
      draft,
      classId,
      optionId: 'starting-gold',
      choiceSetId,
      nestedSelections: {},
      characterClass: equipmentStepBardClassFixture,
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
            grantId: 'standard-equipment',
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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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

    expect(duplicatePatch?.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: 'srd-cc-5.2.1:leather-armor',
        quantity: 2,
        sourceMode: 'startingGold',
      }),
    ])

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
        [startingEquipmentChoiceSetId(classId)]: ['starting-gold'],
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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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

  it('does not treat package-owned items as unique while stack rules are permissive', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
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
    ).toBe(false)
  })

  it('builds purchased gold rows with normalized price lines and purchase remove targets', () => {
    const rationsId = 'srd-cc-5.2.1:rations'
    const purchaseId = 'purchase-presentation-test'
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
            id: purchaseId,
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

    const rows = listEquipmentInventoryRowsFromDraft(draft, catalogIndex)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual(
      expect.objectContaining({
        priceLineLabel: '5 SP each · 1 GP total',
        quantityMode: 'editable',
        removeTarget: { kind: 'purchase', purchaseId },
        quantityTarget: { kind: 'purchase', purchaseId },
      }),
    )
  })

  it('lists removable inventory rows from draft decisions', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
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
      packageItemKey: `${equipmentStepBardClassFixture.id}:standard-equipment:0`,
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

  it('requires proficiency-linked grants before collapsing to the selected package summary', () => {
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

    expect(
      isSelectedStartingEquipmentReady({
        characterClass: equipmentStepMonkClassFixture,
        catalogIndex: equipmentStepCatalogIndexFixture,
        draft,
        selectedOptionId: 'standard-equipment',
      }),
    ).toBe(false)

    expect(
      isSelectedStartingEquipmentReady({
        characterClass: equipmentStepMonkClassFixture,
        catalogIndex: equipmentStepCatalogIndexFixture,
        draft: {
          ...draft,
          choiceSelections: {
            ...draft.choiceSelections,
            [buildChoiceSetId('class', equipmentStepMonkClassFixture.id, 'class-tools')]: [
              equipmentStepLuteFixture.id,
            ],
          },
        },
        selectedOptionId: 'standard-equipment',
      }),
    ).toBe(true)
  })

  it('treats gold options as ready without nested package requirements', () => {
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

    expect(
      isSelectedStartingEquipmentReady({
        characterClass: equipmentStepBardClassFixture,
        catalogIndex: equipmentStepCatalogIndexFixture,
        draft,
        selectedOptionId: 'starting-gold',
      }),
    ).toBe(true)
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
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
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
        [startingEquipmentChoiceSetId(classId)]: ['starting-gold'],
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
    expect(duplicateArmor?.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: equipmentStepLeatherArmorFixture.id,
        quantity: 2,
        sourceMode: 'startingGold',
      }),
    ])
  })
})

describe('starting equipment fallback helpers', () => {
  it('shows fallback only when every package is unselectable and gold is absent', () => {
    const emptyFunding = {
      classOptionWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
      tierAdditionalWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
      totalStartingWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
      classOptionPolicy: 'included' as const,
    }
    const selectable = [
      {
        optionId: 'standard-equipment',
        label: 'Standard',
        orderedItems: [],
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
        funding: { ...emptyFunding, classOptionId: 'standard-equipment' },
      },
    ]

    expect(hasSelectableStartingEquipmentOption(selectable)).toBe(true)
    expect(shouldShowEquipmentFallback(selectable)).toBe(false)

    const broken = [
      {
        optionId: 'broken',
        label: 'Broken',
        orderedItems: [],
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
        funding: { ...emptyFunding, classOptionId: 'broken' },
      },
    ]

    expect(shouldShowEquipmentFallback(broken)).toBe(true)
  })

  it('derives option descriptions from resolved summaries', () => {
    const summaries = resolveStartingEquipmentOptionSummaries(
      equipmentStepBardClassFixture,
      equipmentStepCatalogIndexFixture,
    )
    const standard = summaries.find((summary) => summary.optionId === 'standard-equipment')!

    expect(standard.description).toBe('Leather Armor, 1× Musical Instrument, and 19 GP.')
  })
})
