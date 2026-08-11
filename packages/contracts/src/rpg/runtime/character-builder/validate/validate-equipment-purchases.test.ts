import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { builderTestContext } from '../test-fixtures'
import { validateCharacterBuild } from './validate-character-build'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  EQUIPMENT_PURCHASE_INVALID_ITEM_CODE,
  EQUIPMENT_PURCHASE_INVALID_QUANTITY_CODE,
  EQUIPMENT_PURCHASE_OVER_BUDGET_CODE,
  validateEquipmentPurchases,
} from './validate-equipment-purchases'

const RULESET = 'srd-cc-5.2.1' as const

const pricedRope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const unpricedRelic = equipmentSchema.parse({
  id: `${RULESET}:unpriced-relic`,
  slug: 'unpriced-relic',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Unpriced Relic',
  description: '',
  cost: null,
  kind: 'magic_item',
  rarity: 'rare',
  magicItemCategory: 'wondrous_item',
})

const fighterWithGoldPackage = {
  ...builderTestContext.catalog.classes[0]!,
  characterCreation: {
    proficiencies: builderTestContext.catalog.classes[0]!.characterCreation?.proficiencies,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'pack-a',
          label: 'Pack A',
          items: [],
          wealth: { gp: 10 },
        },
      ],
    },
  },
}

function purchaseDraft(
  purchases: NonNullable<
    ReturnType<typeof createEmptyCharacterBuilderDraft>['equipment']
  >['purchases'],
) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: fighterWithGoldPackage.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(fighterWithGoldPackage.id)]: ['pack-a'],
    },
    equipment: {
      mode: 'package' as const,
      purchases,
      removedPackageItemKeys: [],
      customized: true,
    },
  }
}

function contextWithEquipment(...equipment: (typeof pricedRope)[]) {
  return {
    ...builderTestContext,
    catalog: {
      ...builderTestContext.catalog,
      classes: [fighterWithGoldPackage],
      equipment,
    },
  }
}

describe('validateEquipmentPurchases', () => {
  it('emits equipment_purchase_invalid_item for unpriced equipment', () => {
    const issues = validateEquipmentPurchases(
      purchaseDraft([
        {
          equipmentId: unpricedRelic.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
      ]),
      contextWithEquipment(unpricedRelic),
    )

    expect(issues).toEqual([
      expect.objectContaining({
        code: EQUIPMENT_PURCHASE_INVALID_ITEM_CODE,
        path: 'equipment.purchases.0',
        message: formatFieldMessage(
          characterBuilderValidationMessages.equipmentPurchaseInvalidItem(),
        ),
      }),
    ])
  })

  it('emits equipment_purchase_invalid_quantity for non-positive quantity', () => {
    const issues = validateEquipmentPurchases(
      purchaseDraft([
        { equipmentId: pricedRope.id, quantity: 0, sourceMode: 'startingGold', origin: 'picker' },
      ]),
      contextWithEquipment(pricedRope),
    )

    expect(issues[0]).toMatchObject({
      code: EQUIPMENT_PURCHASE_INVALID_QUANTITY_CODE,
      path: 'equipment.purchases.0',
    })
  })

  it('emits equipment_purchase_over_budget when purchases exceed starting gold', () => {
    const issues = validateEquipmentPurchases(
      purchaseDraft([
        { equipmentId: pricedRope.id, quantity: 6, sourceMode: 'startingGold', origin: 'picker' },
      ]),
      contextWithEquipment(pricedRope),
    )

    expect(issues).toEqual([
      expect.objectContaining({
        code: EQUIPMENT_PURCHASE_OVER_BUDGET_CODE,
        path: 'equipment.purchases',
        message: formatFieldMessage(
          characterBuilderValidationMessages.equipmentPurchaseOverBudget(),
        ),
      }),
    ])
  })

  it('returns no issues for a valid purchase within budget', () => {
    const issues = validateEquipmentPurchases(
      purchaseDraft([
        { equipmentId: pricedRope.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
      ]),
      contextWithEquipment(pricedRope),
    )

    expect(issues).toEqual([])
  })

  it('runs only on finalSubmit, not stepSubmit', () => {
    const draft = purchaseDraft([
      { equipmentId: pricedRope.id, quantity: 6, sourceMode: 'startingGold', origin: 'picker' },
    ])
    const context = contextWithEquipment(pricedRope)

    const purchaseIssues = validateEquipmentPurchases(draft, context)
    expect(purchaseIssues.some((issue) => issue.code === EQUIPMENT_PURCHASE_OVER_BUDGET_CODE)).toBe(
      true,
    )

    const stepResult = validateCharacterBuild(draft, context, 'stepSubmit', {
      stepId: 'equipment',
      resolvedChoiceSets: [],
    })
    expect(
      stepResult.issues.some((issue) => issue.code === EQUIPMENT_PURCHASE_OVER_BUDGET_CODE),
    ).toBe(false)

    const finalResult = validateCharacterBuild(draft, context, 'finalSubmit', {
      resolvedChoiceSets: [],
    })
    expect(
      finalResult.issues.some((issue) => issue.code === EQUIPMENT_PURCHASE_OVER_BUDGET_CODE),
    ).toBe(true)
  })
})
