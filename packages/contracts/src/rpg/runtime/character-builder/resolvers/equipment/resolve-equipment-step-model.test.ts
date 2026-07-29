import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { wealthToCopper } from '../../../../primitives/wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { evaluateEquipmentPackageSwitch } from '../../equipment/equipment-package-switch'
import { createCharacterBuildContext, builderTestRules } from '../../test-fixtures'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import { resolveEquipmentStepModel } from './resolve-equipment-step-model'

const RULESET = 'srd-cc-5.2.1' as const

const storedBarbarian: ClassStored = {
  id: `${RULESET}:barbarian`,
  slug: 'barbarian',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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
          id: 'standard-equipment',
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
          id: 'starting-gold',
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

const buildContext = createCharacterBuildContext({
  catalog: {
    species: [],
    classes: [storedBarbarian],
    spells: [],
    equipment: [],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  },
  characterCreationRules: {
    ...builderTestRules,
    startingWealth: legendStartingWealth,
  },
})

describe('resolveEquipmentStepModel', () => {
  it('agrees with finalize budget starting wealth for the selected option', () => {
    const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBarbarian.id, level: 19 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBarbarian.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const stepModelResult = resolveEquipmentStepModel({
      draft,
      catalogIndex,
      context: buildContext,
      resolvedChoiceSets: [],
      startingWealth: legendStartingWealth,
      includeBudget: true,
    })

    expect(stepModelResult.status).toBe('available')
    if (stepModelResult.status !== 'available') return

    const finalizedBudget = deriveEquipmentBudgetSummary(draft, catalogIndex, {
      startingWealth: legendStartingWealth,
    })

    expect(stepModelResult.model.budget?.starting).toEqual(finalizedBudget?.starting)
    expect(
      wealthToCopper(stepModelResult.model.budget?.starting ?? { cp: 0, sp: 0, gp: 0, pp: 0 }),
    ).toBe(2_145_000)
  })

  it('agrees with package-switch target allowance for the alternate option', () => {
    const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBarbarian.id, level: 19 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBarbarian.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const stepModelResult = resolveEquipmentStepModel({
      draft,
      catalogIndex,
      context: buildContext,
      resolvedChoiceSets: [],
      startingWealth: legendStartingWealth,
      includeBudget: true,
    })

    expect(stepModelResult.status).toBe('available')
    if (stepModelResult.status !== 'available') return

    const targetFunding = stepModelResult.model.fundingByOptionId.get('starting-gold')!
    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: 'starting-gold',
      targetFunding,
    })

    expect(evaluation?.budget.targetAllowanceCp).toBe(
      wealthToCopper(targetFunding.totalStartingWealth),
    )
    expect(stepModelResult.model.budget?.starting).toEqual(
      stepModelResult.model.fundingByOptionId.get('standard-equipment')?.totalStartingWealth,
    )
  })

  it('returns choice_sets_loading when resolved choice sets are null', () => {
    const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBarbarian.id, level: 1 },
    }

    expect(
      resolveEquipmentStepModel({
        draft,
        catalogIndex,
        context: buildContext,
        resolvedChoiceSets: null,
      }),
    ).toEqual({ status: 'unavailable', reason: 'choice_sets_loading' })
  })
})
