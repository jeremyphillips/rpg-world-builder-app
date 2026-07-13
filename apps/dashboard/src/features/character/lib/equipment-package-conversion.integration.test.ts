import { describe, expect, it } from 'vitest'

import {
  buildStartingPackageConversionPatch,
  buildStartingPackageConversionPreview,
  createEmptyCharacterBuilderDraft,
  deriveEquipmentBudgetSummary,
  indexCharacterBuildCatalog,
  resolveEquipmentAcquisitionMaxQuantity,
  resolveEquipmentPurchaseQuantityLimits,
  startingEquipmentChoiceSetId,
  wealthToCopper,
  type ClassStored,
  type Equipment,
} from '@rpg/contracts'

import { buildEquipmentInventoryLayout } from '../components/equipment/equipment-inventory-summary.lib'
import {
  buildEquipmentAddPurchasePatch,
  isUniqueEquipmentOwnedInDraft,
  listEquipmentInventoryRowsFromDraft,
} from './equipment-step.lib'
import {
  equipmentStepDaggerFixture,
  equipmentStepMonkClassFixture,
  equipmentStepSpearFixture,
} from './equipment-step.fixtures'

const torchFixture = {
  id: 'srd-cc-5.2.1:torch',
  slug: 'torch',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Torch',
  description: '',
  cost: { amount: 1, currency: 'cp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
  bundleSize: 1,
} as const satisfies Equipment

const monkWithTorchGrant: ClassStored = {
  ...equipmentStepMonkClassFixture,
  characterCreation: {
    ...equipmentStepMonkClassFixture.characterCreation!,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'spear' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 5,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'torch' },
              quantity: 2,
            },
          ],
          wealth: { gp: 11 },
        },
        {
          id: 'gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [monkWithTorchGrant],
  spells: [],
  equipment: [equipmentStepSpearFixture, equipmentStepDaggerFixture, torchFixture],
  skillProficiencies: [],
  languages: [],
})

function monkPackageDraft() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: monkWithTorchGrant.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(monkWithTorchGrant.id)]: ['standard'],
    },
    equipment: {
      mode: 'package' as const,
      purchases: [],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

function allSelectablePackageItemKeys(
  preview: NonNullable<ReturnType<typeof buildStartingPackageConversionPreview>>,
) {
  return new Set(
    preview.items.filter((item) => item.status === 'selectable').map((item) => item.packageItemKey),
  )
}

describe('equipment package conversion integration', () => {
  it('converts a monk package with fixed daggers and stackable torches into editable purchased rows', () => {
    const draft = monkPackageDraft()
    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      selectedPackageItemKeys: new Set(),
    })!

    const selectedKeys = allSelectablePackageItemKeys(preview)
    const patch = buildStartingPackageConversionPatch({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      selectedPackageItemKeys: selectedKeys,
    })!

    const convertedDraft = {
      ...draft,
      choiceSelections: {
        ...draft.choiceSelections,
        ...patch.choiceSelections,
      },
      equipment: patch.equipment!,
    }

    const budget = deriveEquipmentBudgetSummary(convertedDraft, catalogIndex)!
    const layout = buildEquipmentInventoryLayout(convertedDraft, catalogIndex)!
    const rows = listEquipmentInventoryRowsFromDraft(convertedDraft, catalogIndex)

    const daggerRow = rows.find((row) => row.entry.equipmentId === equipmentStepDaggerFixture.id)
    const torchRow = rows.find((row) => row.entry.equipmentId === torchFixture.id)

    expect(layout.mode).toBe('gold')
    expect(daggerRow?.entry.quantity).toBe(5)
    expect(daggerRow?.quantityMode).toBe('editable')
    expect(daggerRow?.removeTarget).toEqual(
      expect.objectContaining({ kind: 'purchase', purchaseId: expect.any(String) }),
    )

    expect(torchRow?.entry.quantity).toBe(2)
    expect(torchRow?.quantityMode).toBe('editable')
    expect(torchRow?.quantityTarget).toEqual(
      expect.objectContaining({ kind: 'purchase', purchaseId: expect.any(String) }),
    )

    const daggerLimits = resolveEquipmentPurchaseQuantityLimits({
      equipment: equipmentStepDaggerFixture,
      sourceMode: 'startingGold',
      origin: 'packageConversion',
      budget,
      currentQuantity: 5,
      isPurchaseRow: true,
    })
    expect(daggerLimits.editable).toBe(true)
    expect(daggerLimits.max).toBeGreaterThan(5)

    const torchLimits = resolveEquipmentPurchaseQuantityLimits({
      equipment: torchFixture,
      sourceMode: 'startingGold',
      origin: 'packageConversion',
      budget,
      currentQuantity: 2,
      isPurchaseRow: true,
    })
    expect(torchLimits.editable).toBe(true)

    const torchAcquisitionMax = resolveEquipmentAcquisitionMaxQuantity({
      equipment: torchFixture,
      budget,
      currentQuantity: 2,
    })
    expect(torchAcquisitionMax).toBeGreaterThan(2)

    expect(
      isUniqueEquipmentOwnedInDraft(convertedDraft, catalogIndex, equipmentStepDaggerFixture.id),
    ).toBe(false)
    const addMoreDaggers = buildEquipmentAddPurchasePatch({
      draft: convertedDraft,
      catalogIndex,
      equipmentId: equipmentStepDaggerFixture.id,
      sourceMode: 'startingGold',
    })
    if (addMoreDaggers) {
      const daggerQuantity = (addMoreDaggers.equipment?.purchases ?? [])
        .filter((purchase) => purchase.equipmentId === equipmentStepDaggerFixture.id)
        .reduce((total, purchase) => total + purchase.quantity, 0)
      expect(daggerQuantity).toBeGreaterThan(5)
    }

    const conversionPreview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      selectedPackageItemKeys: selectedKeys,
    })!
    expect(wealthToCopper(budget.remaining)).toBe(conversionPreview.budget.remainingCp)
  })
})
