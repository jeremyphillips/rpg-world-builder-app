import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

import {
  PACKAGE_SWITCH_STAGED_REMOVAL_LABEL,
  buildPackageSwitchDraftPurchasedGroups,
  mapBlockingReasonToMessage,
  packageSwitchDraftHasEdits,
  resolvePackageSwitchDescriptionParts,
  resolvePackageSwitchModalState,
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
    expect(groups[0]?.displays).toHaveLength(1)
    const display = groups[0]?.displays[0]
    expect(display?.kind).toBe('single')
    if (display?.kind !== 'single') return

    expect(display.row.entry.quantity).toBe(0)
    expect(display.row.stagedRemoval).toBe(true)
    expect(display.row.sourceLabel).toBe(PACKAGE_SWITCH_STAGED_REMOVAL_LABEL)
    expect(display.row.maxQuantity).toBe(62)
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
