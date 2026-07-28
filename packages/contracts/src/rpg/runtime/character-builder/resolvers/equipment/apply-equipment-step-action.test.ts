import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { equipmentSchema } from '../../../../content/equipment'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import {
  createEquipmentPackageSwitchInventorySnapshot,
  initPackageSwitchDraftQuantities,
} from '../../equipment/equipment-package-switch'
import { evaluateEquipmentPackageSwitch } from '../../equipment/equipment-package-switch'
import { resolveStartingEquipmentFundingOptions } from './resolve-starting-equipment-funding'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import { applyEquipmentStepAction } from './apply-equipment-step-action'

const RULESET = 'srd-cc-5.2.1' as const

const storedRations = equipmentSchema.parse({
  id: `${RULESET}:rations`,
  slug: 'rations',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rations',
  description: '',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 2, unit: 'lb' },
})

const rope = equipmentSchema.parse({
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
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { kind: 'grant', target: { source: 'equipment', equipmentSlug: 'rope' }, quantity: 1 },
          ],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

function packageSwitchCatalogIndex() {
  return indexCharacterBuildCatalog({
    species: [],
    classes: [storedDruid],
    spells: [],
    equipment: [rope, storedRations],
    skillProficiencies: [],
    languages: [],
  })
}

function goldDraftWithRope(quantity: number) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: storedDruid.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(storedDruid.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold' as const,
      purchases: [
        {
          id: 'purchase-rope',
          equipmentId: rope.id,
          quantity,
          sourceMode: 'startingGold' as const,
          origin: 'picker' as const,
        },
      ],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

describe('applyEquipmentStepAction', () => {
  it('applies set_purchase_quantity for an editable starting-gold purchase row', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [],
      spells: [],
      equipment: [storedRations],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            id: 'purchase-1',
            equipmentId: storedRations.id,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const result = applyEquipmentStepAction({
      draft,
      catalogIndex,
      action: { kind: 'set_purchase_quantity', purchaseId: 'purchase-1', quantity: 5 },
      budget: {
        starting: { cp: 0, sp: 0, gp: 10, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 10, pp: 0 },
      },
    })

    expect(result).toEqual({
      status: 'applied',
      patch: {
        equipment: {
          ...draft.equipment,
          purchases: [{ ...draft.equipment!.purchases[0]!, quantity: 5 }],
        },
      },
    })
  })

  it('returns invalid when the purchase row is not editable', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [],
      spells: [],
      equipment: [storedRations],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            id: 'purchase-1',
            equipmentId: storedRations.id,
            quantity: 1,
            sourceMode: 'manual' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const result = applyEquipmentStepAction({
      draft,
      catalogIndex,
      action: { kind: 'set_purchase_quantity', purchaseId: 'purchase-1', quantity: 3 },
    })

    expect(result).toEqual({
      status: 'invalid',
      issues: [{ code: 'quantity_not_editable', reference: { purchaseId: 'purchase-1' } }],
    })
  })

  it('returns invalid when the purchase id is unknown', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [],
      spells: [],
      equipment: [storedRations],
      skillProficiencies: [],
      languages: [],
    })

    const result = applyEquipmentStepAction({
      draft: createEmptyCharacterBuilderDraft(),
      catalogIndex,
      action: { kind: 'set_purchase_quantity', purchaseId: 'missing', quantity: 1 },
    })

    expect(result).toEqual({
      status: 'invalid',
      issues: [{ code: 'equipment_channel_missing' }],
    })
  })

  it('returns needs_resolution when select_package conflicts with retained purchases', () => {
    const catalogIndex = packageSwitchCatalogIndex()
    const draft = goldDraftWithRope(31)
    const choiceSetId = startingEquipmentChoiceSetId(storedDruid.id)

    const result = applyEquipmentStepAction({
      draft,
      catalogIndex,
      action: {
        kind: 'select_package',
        optionId: 'standard-equipment',
        choiceSetId,
        nestedSelections: {},
      },
    })

    expect(result.status).toBe('needs_resolution')
    if (result.status !== 'needs_resolution') return
    expect(result.resolution.status).toBe('resolvable')
    expect(result.resolution.targetOptionId).toBe('standard-equipment')
  })

  it('applies resolve_package_switch when draft quantities fit the target allowance', () => {
    const catalogIndex = packageSwitchCatalogIndex()
    const draft = goldDraftWithRope(62)
    draft.equipment!.customized = true
    const choiceSetId = startingEquipmentChoiceSetId(storedDruid.id)
    const targetFunding = resolveStartingEquipmentFundingOptions({
      draft,
      catalogIndex,
    }).get('standard-equipment')!
    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding,
    })!
    const draftQuantities = initPackageSwitchDraftQuantities(evaluation)
    draftQuantities['purchase-rope'] = 9

    const result = applyEquipmentStepAction({
      draft,
      catalogIndex,
      action: {
        kind: 'resolve_package_switch',
        targetOptionId: 'standard-equipment',
        choiceSetId,
        nestedSelections: {},
        draftQuantitiesByPurchaseId: draftQuantities,
        committedInventorySnapshot: createEquipmentPackageSwitchInventorySnapshot(draft),
      },
    })

    expect(result.status).toBe('applied')
    if (result.status !== 'applied') return
    expect(result.patch.choiceSelections?.[choiceSetId]).toEqual(['standard-equipment'])
    expect(result.patch.equipment?.purchases).toEqual([
      expect.objectContaining({ equipmentId: rope.id, quantity: 9 }),
    ])
  })

  it('returns invalid when resolve_package_switch sees stale inventory', () => {
    const catalogIndex = packageSwitchCatalogIndex()
    const draft = goldDraftWithRope(62)
    const choiceSetId = startingEquipmentChoiceSetId(storedDruid.id)
    const snapshot = createEquipmentPackageSwitchInventorySnapshot(draft)
    const changedDraft = goldDraftWithRope(60)
    const targetFunding = resolveStartingEquipmentFundingOptions({
      draft: changedDraft,
      catalogIndex,
    }).get('standard-equipment')!
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: changedDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding,
    })!
    const draftQuantities = initPackageSwitchDraftQuantities(evaluation)
    draftQuantities['purchase-rope'] = 9

    const result = applyEquipmentStepAction({
      draft: changedDraft,
      catalogIndex,
      action: {
        kind: 'resolve_package_switch',
        targetOptionId: 'standard-equipment',
        choiceSetId,
        nestedSelections: {},
        draftQuantitiesByPurchaseId: draftQuantities,
        committedInventorySnapshot: snapshot,
      },
    })

    expect(result).toEqual({
      status: 'invalid',
      issues: [{ code: 'package_switch_stale_inventory' }],
    })
  })
})
