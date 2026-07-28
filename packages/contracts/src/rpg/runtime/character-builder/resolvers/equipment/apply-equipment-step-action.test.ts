import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
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
})
