import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import type { ClassStored } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import {
  PACKAGE_SWITCH_STAGED_REMOVAL_LABEL,
  buildPackageSwitchDraftPurchasedGroups,
  mapBlockingReasonToMessage,
  packageSwitchDraftHasEdits,
  resolvePackageSwitchDescription,
} from './equipment-package-switch-resolution.lib'

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
          items: [
            { kind: 'grant', target: { source: 'equipment', equipmentSlug: 'rope' }, quantity: 1 },
          ],
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

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope],
  skillProficiencies: [],
  languages: [],
})

const goldDraft = {
  ...createEmptyCharacterBuilderDraft(),
  class: { classId: storedDruid.id, level: 1 as const },
  choiceSelections: {
    [startingEquipmentChoiceSetId(storedDruid.id)]: ['gold'],
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
    removedPackageItemKeys: [],
    customized: false,
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
    ).toBe('Remove 4 GP more to continue.')
  })

  it('builds draft purchased groups with staged removal rows at quantity zero', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard',
      targetFunding: targetFundingFor('standard'),
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

  it('detects draft edits against committed quantities', () => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft: goldDraft,
      catalogIndex,
      targetOptionId: 'standard',
      targetFunding: targetFundingFor('standard'),
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
      targetOptionId: 'standard',
      targetFunding: targetFundingFor('standard'),
    })!

    expect(resolvePackageSwitchDescription(evaluation)).toContain('Standard Equipment allows')
    expect(resolvePackageSwitchDescription(evaluation)).toContain(
      'Your inventory will not change until you confirm.',
    )
  })
})
