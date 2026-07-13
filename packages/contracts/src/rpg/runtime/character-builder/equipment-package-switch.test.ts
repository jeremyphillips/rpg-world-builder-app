import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../content/equipment'
import type { ClassStored } from '../../content/classes/class'
import { indexCharacterBuildCatalog } from './context'
import { createEmptyCharacterBuilderDraft } from './draft'
import {
  buildEquipmentPackageSwitchPatch,
  createEquipmentPackageSwitchInventorySnapshot,
  equipmentPackageSwitchSnapshotsEqual,
  evaluateEquipmentPackageSwitch,
  initPackageSwitchDraftQuantities,
  rebuildPackageSwitchDraftQuantities,
} from './equipment-package-switch'
import { startingEquipmentChoiceSetId } from './resolvers/equipment/resolve-starting-equipment-choice-sets'
import { createEquipmentPurchaseId } from './equipment-purchase'

const RULESET = 'srd-cc-5.2.1' as const

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const dagger = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 4 },
  damageType: 'piercing',
  properties: [],
  mastery: 'nick',
})

const silverNeedle = equipmentSchema.parse({
  id: `${RULESET}:silver-needle`,
  slug: 'silver-needle',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Silver Needle',
  description: '',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 0, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          items: [],
          wealth: { gp: 9, sp: 5, cp: 3 },
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

function buildCatalogIndex() {
  return indexCharacterBuildCatalog({
    species: [],
    classes: [storedDruid],
    spells: [],
    equipment: [rope, dagger, silverNeedle],
    skillProficiencies: [],
    languages: [],
  })
}

function goldDraftWithPurchases(
  purchases: Array<{
    id: string
    equipmentId: string
    quantity: number
    sourceMode?: 'startingGold' | 'manual'
    origin?: 'picker' | 'packageConversion'
  }>,
) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: storedDruid.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(storedDruid.id)]: ['gold'],
    },
    equipment: {
      mode: 'gold' as const,
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        equipmentId: purchase.equipmentId,
        quantity: purchase.quantity,
        sourceMode: purchase.sourceMode ?? ('startingGold' as const),
        origin: purchase.origin ?? ('picker' as const),
      })),
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

describe('evaluateEquipmentPackageSwitch', () => {
  const catalogIndex = buildCatalogIndex()

  it('returns noConflict when retained purchases fit the target allowance', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 3 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })

    expect(evaluation?.status).toBe('noConflict')
    expect(evaluation?.budget.totalRetainedCostCp).toBe(300)
    expect(evaluation?.budget.targetAllowanceCp).toBe(953)
  })

  it('returns resolvable when gold purchases exceed the standard allowance', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-dagger', equipmentId: dagger.id, quantity: 31 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })

    expect(evaluation?.status).toBe('resolvable')
    expect(evaluation?.budget.totalRetainedCostCp).toBe(6200)
    expect(evaluation?.budget.initialAmountOverBudgetCp).toBe(6200 - 953)
    expect(evaluation?.editableItems).toHaveLength(1)
  })

  it('separates editable and non-editable retained costs', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-dagger', equipmentId: dagger.id, quantity: 10, sourceMode: 'manual' },
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 5 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })

    expect(evaluation?.budget.nonEditableRetainedCostCp).toBe(2000)
    expect(evaluation?.budget.editableRetainedCostCp).toBe(500)
    expect(evaluation?.budget.totalRetainedCostCp).toBe(2500)
    expect(evaluation?.editableItems).toHaveLength(1)
  })

  it('blocks when non-editable purchases alone exceed the allowance', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-dagger', equipmentId: dagger.id, quantity: 10, sourceMode: 'manual' },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })

    expect(evaluation?.status).toBe('blocked')
    expect(evaluation?.blockingReason).toEqual({
      kind: 'nonEditableOverBudget',
      nonEditableRetainedCostCp: 2000,
      targetAllowanceCp: 953,
    })
  })

  it('validates draft quantities and preserves SP precision', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-needle', equipmentId: silverNeedle.id, quantity: 200 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
      draftQuantitiesByPurchaseId: { 'purchase-needle': 199 },
    })

    expect(evaluation?.budget.draftEditableCostCp).toBe(9950)
    expect(evaluation?.budget.draftTotalCostCp).toBe(9950)
    expect(evaluation?.budget.isDraftValid).toBe(false)
    expect(evaluation?.blockingReason).toEqual({
      kind: 'draftOverBudget',
      amountOverBudgetCp: 9950 - 953,
    })

    const validEvaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
      draftQuantitiesByPurchaseId: { 'purchase-needle': 19 },
    })

    expect(validEvaluation?.budget.isDraftValid).toBe(true)
    expect(validEvaluation?.budget.amountOverBudgetCp).toBe(0)
    expect(validEvaluation?.budget.remainingAllowanceCp).toBe(3)
  })

  it('treats draft quantity zero as staged removal in budget math', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 62 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
      draftQuantitiesByPurchaseId: { 'purchase-rope': 0 },
    })

    expect(evaluation?.budget.draftEditableCostCp).toBe(0)
    expect(evaluation?.budget.isDraftValid).toBe(true)
  })

  it('detects stale committed inventory snapshots', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 62 },
    ])
    const snapshot = createEquipmentPackageSwitchInventorySnapshot(draft)

    const changedDraft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 60 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft: changedDraft,
      catalogIndex,
      targetOptionId: 'standard',
      draftQuantitiesByPurchaseId: { 'purchase-rope': 50 },
      committedInventorySnapshot: snapshot,
    })

    expect(evaluation?.blockingReason?.kind).toBe('staleCommittedInventory')
    expect(
      equipmentPackageSwitchSnapshotsEqual(
        snapshot,
        createEquipmentPackageSwitchInventorySnapshot(changedDraft),
      ),
    ).toBe(false)
  })
})

describe('buildEquipmentPackageSwitchPatch', () => {
  const catalogIndex = buildCatalogIndex()

  it('commits purchase reductions and package selection atomically', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 62 },
    ])
    draft.equipment!.customized = true

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })!
    const draftQuantities = initPackageSwitchDraftQuantities(evaluation)
    draftQuantities['purchase-rope'] = 9

    const snapshot = createEquipmentPackageSwitchInventorySnapshot(draft)
    const choiceSetId = startingEquipmentChoiceSetId(storedDruid.id)

    const result = buildEquipmentPackageSwitchPatch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
      choiceSetId,
      nestedSelections: {},
      draftQuantitiesByPurchaseId: draftQuantities,
      committedInventorySnapshot: snapshot,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') return

    expect(result.patch.choiceSelections?.[choiceSetId]).toEqual(['standard'])
    expect(result.patch.equipment?.mode).toBe('package')
    expect(result.patch.equipment?.purchases).toEqual([
      expect.objectContaining({ equipmentId: rope.id, quantity: 9 }),
    ])
    expect(result.patch.equipment?.customized).toBe(true)
  })

  it('rejects stale commits without emitting a patch', () => {
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 62 },
    ])
    const snapshot = createEquipmentPackageSwitchInventorySnapshot(draft)
    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })!
    const draftQuantities = initPackageSwitchDraftQuantities(evaluation)
    draftQuantities['purchase-rope'] = 9

    const changedDraft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 60 },
    ])

    const result = buildEquipmentPackageSwitchPatch({
      draft: changedDraft,
      catalogIndex,
      targetOptionId: 'standard',
      choiceSetId: startingEquipmentChoiceSetId(storedDruid.id),
      nestedSelections: {},
      draftQuantitiesByPurchaseId: draftQuantities,
      committedInventorySnapshot: snapshot,
    })

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') return
    expect(result.commitError.kind).toBe('staleCommittedInventory')
  })

  it('removes purchases staged at quantity zero on commit', () => {
    const purchaseId = createEquipmentPurchaseId()
    const draft = goldDraftWithPurchases([{ id: purchaseId, equipmentId: rope.id, quantity: 62 }])
    const snapshot = createEquipmentPackageSwitchInventorySnapshot(draft)

    const result = buildEquipmentPackageSwitchPatch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
      choiceSetId: startingEquipmentChoiceSetId(storedDruid.id),
      nestedSelections: {},
      draftQuantitiesByPurchaseId: { [purchaseId]: 0 },
      committedInventorySnapshot: snapshot,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') return
    expect(result.patch.equipment?.purchases).toEqual([])
  })
})

describe('rebuildPackageSwitchDraftQuantities', () => {
  it('keeps valid prior draft quantities and resets invalid entries', () => {
    const catalogIndex = buildCatalogIndex()
    const draft = goldDraftWithPurchases([
      { id: 'purchase-rope', equipmentId: rope.id, quantity: 62 },
      { id: 'purchase-dagger', equipmentId: dagger.id, quantity: 2 },
    ])

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard',
    })!

    const rebuilt = rebuildPackageSwitchDraftQuantities({
      previousDraftQuantities: {
        'purchase-rope': 40,
        'purchase-dagger': 99,
        'missing-purchase': 1,
      },
      evaluation,
    })

    expect(rebuilt).toEqual({
      'purchase-rope': 40,
      'purchase-dagger': 2,
    })
  })
})
