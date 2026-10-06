import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import {
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepMonkClassFixture,
} from './equipment-step.fixtures'
import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

import {
  PACKAGE_SWITCH_STAGED_REMOVAL_LABEL,
  buildPackageSwitchDraftPurchasedGroups,
  buildPackageSwitchReconciliationDraft,
  mapBlockingReasonToMessage,
  packageSwitchDraftHasEdits,
  resolvePackageSwitchDescriptionParts,
  resolvePackageSwitchModalState,
  resolvePackageSwitchSelectionFacts,
} from './equipment-package-switch-resolution.lib'

const rope = pickEquipment('rope')
const storedDruid = storedDruidClassStored

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope],
  skillProficiencies: [],
  organizations: [],
  languages: [],
})

const goldDraft = {
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
        quantity: 62,
        sourceMode: 'startingGold' as const,
        origin: 'picker' as const,
      },
    ],
    editedSincePackageSelection: false,
  },
}

function targetFundingFor(targetOptionId: string) {
  return resolveStartingEquipmentFundingOptions({ draft: goldDraft, catalogIndex }).get(
    targetOptionId,
  )!
}

describe('equipment-package-switch-resolution.lib', () => {
  it('maps blocking reasons to user-facing copy', () => {
    expect(
      mapBlockingReasonToMessage({
        kind: 'draftOverBudget',
        amountOverBudgetCp: 400,
      }),
    ).toBe('Remove 4 GP to continue.')
  })

  it('builds draft purchased groups with staged removal rows at quantity zero', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding: targetFundingFor('standard-equipment'),
    })!

    const groups = buildPackageSwitchDraftPurchasedGroups({
      evaluation,
      draftQuantitiesByPurchaseId: { 'purchase-rope': 0 },
      catalogIndex,
    })

    expect(groups).toHaveLength(1)
    expect(groups[0]?.items).toHaveLength(1)
    expect(groups[0]?.items[0]?.status).toEqual([])
    const display = groups[0]?.items[0]?.display
    expect(display?.kind).toBe('single')
    if (display?.kind !== 'single') return

    expect(display.row.entry.quantity).toBe(0)
    expect(display.row.stagedRemoval).toBe(true)
    expect(display.row.sourceLabel).toBe(PACKAGE_SWITCH_STAGED_REMOVAL_LABEL)
    expect(display.row.maxQuantity).toBe(62)
  })

  describe('reconciliation facts', () => {
    const monkDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            id: 'purchase-axe',
            equipmentId: equipmentStepBattleaxeFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    it('builds the target draft without the trimmable purchases', () => {
      const reconciliationDraft = buildPackageSwitchReconciliationDraft({
        draft: monkDraft,
        catalogIndex: equipmentStepCatalogIndexFixture,
        targetOptionId: 'standard-equipment',
        trimmablePurchaseIds: ['purchase-axe'],
      })

      expect(
        reconciliationDraft?.choiceSelections?.[
          startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)
        ],
      ).toEqual(['standard-equipment'])
      expect(reconciliationDraft?.equipment?.purchases ?? []).toEqual([])
    })

    it('returns no draft for an unknown target option', () => {
      expect(
        buildPackageSwitchReconciliationDraft({
          draft: monkDraft,
          catalogIndex: equipmentStepCatalogIndexFixture,
          targetOptionId: 'missing-option',
          trimmablePurchaseIds: [],
        }),
      ).toBeUndefined()
    })

    it('resolves trim-row status in the reconciliation context', () => {
      const targetFunding = resolveStartingEquipmentFundingOptions({
        draft: monkDraft,
        catalogIndex: equipmentStepCatalogIndexFixture,
      }).get('standard-equipment')!
      const evaluation = evaluateEquipmentPackageSwitch({
        draft: monkDraft,
        catalogIndex: equipmentStepCatalogIndexFixture,
        targetOptionId: 'standard-equipment',
        targetFunding,
      })!
      const selectionFacts = resolvePackageSwitchSelectionFacts({
        draft: monkDraft,
        catalogIndex: equipmentStepCatalogIndexFixture,
        choiceSets: [],
        targetOptionId: 'standard-equipment',
        trimmablePurchaseIds: evaluation.editableItems.map((item) => item.purchaseId),
      })

      const groups = buildPackageSwitchDraftPurchasedGroups({
        evaluation,
        draftQuantitiesByPurchaseId: { 'purchase-axe': 1 },
        catalogIndex: equipmentStepCatalogIndexFixture,
        selectionFacts,
      })

      expect(groups[0]?.items[0]?.status).toEqual([
        expect.objectContaining({ kind: 'badge', label: 'Not proficient', tone: 'warning' }),
      ])
    })
  })

  it('uses selection copy when no option was selected before the request', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding: targetFundingFor('standard-equipment'),
    })!

    expect(resolvePackageSwitchModalState({ evaluation, isInitialSelection: true })).toMatchObject({
      title: 'Adjust purchases for this option',
      confirmLabel: 'Choose option',
    })
    expect(resolvePackageSwitchModalState({ evaluation })).toMatchObject({
      title: 'Adjust purchases before switching',
      confirmLabel: 'Switch package',
    })
  })

  it('detects draft edits against committed quantities', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding: targetFundingFor('standard-equipment'),
    })!

    expect(
      packageSwitchDraftHasEdits(evaluation, {
        'purchase-rope': 62,
      }),
    ).toBe(false)
    expect(
      packageSwitchDraftHasEdits(evaluation, {
        'purchase-rope': 50,
      }),
    ).toBe(true)
  })

  it('builds modal description from live evaluation values', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding: targetFundingFor('standard-equipment'),
    })!

    expect(resolvePackageSwitchDescriptionParts(evaluation)).toEqual({
      lead: expect.stringMatching(/^Standard Equipment provides .+ for purchases\.$/),
      detail: 'Reduce your current purchases to fit this amount.',
    })
  })
})
