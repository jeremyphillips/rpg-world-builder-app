import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { wealthToCopper } from '../../../../primitives/wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { evaluateEquipmentPackageSwitch } from '../../equipment-package-switch'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import { resolveEquipmentStepModel } from './resolve-equipment-step-model'

const RULESET = 'srd-cc-5.2.1' as const

const storedBarbarian: ClassStored = {
  id: `${RULESET}:barbarian`,
  slug: 'barbarian',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Barbarian',
  primaryAbilities: ['str'],
  hitDie: 12,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'shields'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
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
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'greataxe' },
              quantity: 1,
            },
          ],
          wealth: { gp: 15 },
        },
        {
          id: 'gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 75 },
        },
      ],
    },
  },
}

const legendStartingWealth = {
  name: 'Legend',
  scope: { kind: 'standard' as const },
  tiers: [
    {
      id: 'legend',
      label: 'Legend',
      minLevel: 19,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      magicItemGrants: [],
      bonusGold: {
        baseGp: 21_375,
        formula: {
          kind: 'dice' as const,
          dice: { count: 1, faces: 6 as const },
          multiplier: 0,
          currency: 'gp' as const,
        },
      },
    },
  ],
}

describe('resolveEquipmentStepModel', () => {
  it('agrees with finalize budget starting wealth for the selected option', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedBarbarian],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBarbarian.id, level: 19 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBarbarian.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const stepModel = resolveEquipmentStepModel({
      draft,
      catalogIndex,
      startingWealth: legendStartingWealth,
      includeBudget: true,
    })

    const finalizedBudget = deriveEquipmentBudgetSummary(draft, catalogIndex, {
      startingWealth: legendStartingWealth,
    })

    expect(stepModel?.budget?.starting).toEqual(finalizedBudget?.starting)
    expect(wealthToCopper(stepModel?.budget?.starting ?? { cp: 0, sp: 0, gp: 0, pp: 0 })).toBe(
      2_145_000,
    )
  })

  it('agrees with package-switch target allowance for the alternate option', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedBarbarian],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBarbarian.id, level: 19 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBarbarian.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const stepModel = resolveEquipmentStepModel({
      draft,
      catalogIndex,
      startingWealth: legendStartingWealth,
      includeBudget: true,
    })

    const targetFunding = stepModel!.fundingByOptionId.get('gold')!
    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'gold',
      targetFunding,
    })

    expect(evaluation?.budget.targetAllowanceCp).toBe(
      wealthToCopper(targetFunding.totalStartingWealth),
    )
    expect(stepModel?.budget?.starting).toEqual(
      stepModel?.fundingByOptionId.get('standard')?.totalStartingWealth,
    )
  })
})
