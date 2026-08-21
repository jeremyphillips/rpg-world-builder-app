import { describe, expect, it } from 'vitest'

import {
  applyEquipmentPurchaseIntent,
  buildChoiceSetId,
  buildMagicItemAllowanceId,
  createEmptyCharacterBuilderDraft,
  deriveEquipmentDraftEntries,
  indexCharacterBuildCatalog,
  resolveEquipmentAcquisitionBuilderContext,
  standardStartingWealthTableId,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import { buildEquipmentInventoryViewModel } from '../../components/equipment/inventory/equipment-inventory-summary.lib'
import {
  createEquipmentStepContextWithMagicItemGrantsFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogFixture,
  equipmentStepHeroMagicItemWealthFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
  equipmentStepSpearFixture,
} from './equipment-step.fixtures'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const monkToolChoiceSetId = buildChoiceSetId(
  'class',
  equipmentStepMonkClassFixture.id,
  'class-tools',
)

const commonAllowanceId = buildMagicItemAllowanceId({
  startingWealthTableId: TABLE_ID,
  tierId: 'hero',
  rarity: 'common',
})

import { makeCharacterBuildCatalog } from '@/test/fixtures/factories/additional/character-build-catalog'

const cartCatalogFixture = makeCharacterBuildCatalog({
  ...equipmentStepCatalogFixture,
  equipment: [...equipmentStepCatalogFixture.equipment, equipmentStepBattleaxeFixture],
})

const cartCatalogIndex = indexCharacterBuildCatalog(cartCatalogFixture)

const cartContext = createEquipmentStepContextWithMagicItemGrantsFixture({
  catalog: cartCatalogFixture,
})

function packageDraftWithMagicItemGrant() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
    },
    equipment: {
      mode: 'package' as const,
      purchases: [],
      magicItemSelections: [
        {
          allowanceId: commonAllowanceId,
          equipmentId: equipmentStepPotionOfHealingFixture.id,
          quantity: 1,
        },
      ],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

describe('equipment cart integration', () => {
  it('keeps package authority and all inventory channels after purchase on the package path', () => {
    const draft = packageDraftWithMagicItemGrant()
    const acquisitionContext = resolveEquipmentAcquisitionBuilderContext({
      context: cartContext,
      catalogIndex: cartCatalogIndex,
      startingWealthTableId: TABLE_ID,
    })

    const purchaseResult = applyEquipmentPurchaseIntent({
      draft,
      context: acquisitionContext,
      equipment: equipmentStepBattleaxeFixture,
      requestedQuantity: 1,
    })

    expect(purchaseResult.applied).toBe(true)
    expect(
      purchaseResult.draft.choiceSelections[
        startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)
      ],
    ).toEqual(['standard-equipment'])
    expect(purchaseResult.draft.equipment?.mode).toBe('package')
    expect(purchaseResult.draft.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: equipmentStepBattleaxeFixture.id,
        quantity: 1,
        sourceMode: 'startingGold',
      }),
    ])

    const viewModel = buildEquipmentInventoryViewModel(
      purchaseResult.draft,
      cartCatalogIndex,
      undefined,
      'included',
      cartContext,
    )

    expect(viewModel?.startingEquipment.kind).toBe('package')
    if (viewModel?.startingEquipment.kind !== 'package') return

    expect(viewModel.startingEquipment.group.optionLabel).toBe('Standard Equipment')
    expect(
      viewModel.startingEquipment.group.categoryGroups.some((group) =>
        group.rows.some((row) => row.equipmentName === 'Spear'),
      ),
    ).toBe(true)

    const magicItemEntries = viewModel.addedEquipment.find(
      (group) => group.groupLabel === 'Magic Items',
    )?.entries
    expect(magicItemEntries).toHaveLength(1)
    expect(magicItemEntries?.[0]).toMatchObject({
      equipmentId: equipmentStepPotionOfHealingFixture.id,
      equipmentName: 'Potion of Healing',
      totalQuantity: 1,
    })

    const weaponEntries = viewModel.addedEquipment.find(
      (group) => group.groupLabel === 'Weapons',
    )?.entries
    expect(weaponEntries).toHaveLength(1)
    expect(weaponEntries?.[0]).toMatchObject({
      equipmentId: equipmentStepBattleaxeFixture.id,
      equipmentName: 'Battleaxe',
      totalQuantity: 1,
    })

    const equipment = deriveEquipmentDraftEntries(purchaseResult.draft, cartCatalogIndex, {
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
      rulesetId: RULESET,
    })

    expect(equipment.weapons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          equipmentId: equipmentStepSpearFixture.id,
          sources: expect.arrayContaining([
            expect.objectContaining({ kind: 'classStartingEquipment' }),
          ]),
        }),
        expect.objectContaining({
          equipmentId: equipmentStepBattleaxeFixture.id,
          sources: expect.arrayContaining([expect.objectContaining({ kind: 'startingGold' })]),
        }),
      ]),
    )
    expect(equipment.magicItems).toEqual([
      expect.objectContaining({
        equipmentId: equipmentStepPotionOfHealingFixture.id,
        quantity: 1,
        sources: expect.arrayContaining([expect.objectContaining({ kind: 'startingWealthTier' })]),
      }),
    ])
  })
})
