import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { equipmentSchema } from '../../../../content/equipment'
import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { bardClass, luteTool, proficiencyTestCatalog } from '../../proficiency-test-fixtures'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import {
  hasUnfulfilledCategoryEquipmentNeed,
  isGoldShoppingPath,
  poolHasSemanticCategories,
} from './derive-proficiency-recommendation-contributions'

const RULESET = 'srd-cc-5.2.1' as const

const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

const storedBardWithStartingEquipment: ClassStored = {
  ...bardClass,
  characterCreation: {
    ...bardClass.characterCreation,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'lute' },
              quantity: 1,
            },
          ],
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 90 },
        },
      ],
    },
  },
}

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

describe('poolHasSemanticCategories', () => {
  it('returns true for filtered pools with tool categories', () => {
    expect(
      poolHasSemanticCategories({
        source: 'filtered',
        toolCategories: ['musical_instrument'],
      }),
    ).toBe(true)
  })

  it('returns false when the pool has no tool categories', () => {
    expect(poolHasSemanticCategories({ source: 'filtered', toolCategories: [] })).toBe(false)
    expect(poolHasSemanticCategories({ source: 'filtered' })).toBe(false)
  })

  it('returns false for non-filtered pools', () => {
    expect(poolHasSemanticCategories({ source: 'any' })).toBe(false)
  })
})

describe('isGoldShoppingPath', () => {
  const goldOption: StartingEquipmentOption = {
    id: 'starting-gold',
    label: 'Starting Gold',
    items: [],
    wealth: { gp: 90 },
  }

  const packageOption: StartingEquipmentOption = {
    id: 'standard-equipment',
    label: 'Standard Equipment',
    items: [
      {
        kind: 'grant',
        target: { source: 'equipment', equipmentSlug: 'lute' },
        quantity: 1,
      },
    ],
  }

  it('returns true when the selected option is wealth-only', () => {
    expect(isGoldShoppingPath(createEmptyCharacterBuilderDraft(), goldOption)).toBe(true)
  })

  it('returns false when no option is selected', () => {
    expect(isGoldShoppingPath(createEmptyCharacterBuilderDraft(), undefined)).toBe(false)
  })

  it('returns false for a package starting option', () => {
    expect(isGoldShoppingPath(createEmptyCharacterBuilderDraft(), packageOption)).toBe(false)
  })
})

describe('hasUnfulfilledCategoryEquipmentNeed', () => {
  const categoryPool = {
    source: 'filtered' as const,
    toolCategories: ['musical_instrument' as const],
  }

  it('returns true on the gold path when no package satisfies the category need', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBardWithStartingEquipment.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBardWithStartingEquipment.id)]: ['starting-gold'],
      },
    }

    const selectedOption =
      storedBardWithStartingEquipment.characterCreation?.startingEquipment?.options.find(
        (option) => option.id === 'starting-gold',
      )

    expect(
      hasUnfulfilledCategoryEquipmentNeed({
        draft,
        selectedOption,
        categoryPool,
        characterClass: storedBardWithStartingEquipment,
        catalogIndex: indexCharacterBuildCatalog({
          ...proficiencyTestCatalog,
          equipment: [luteTool, leatherArmor],
        }),
        classId: storedBardWithStartingEquipment.id,
        optionId: 'starting-gold',
      }),
    ).toBe(true)
  })

  it('returns false when the selected package already grants matching tool equipment', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedBardWithStartingEquipment.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBardWithStartingEquipment.id)]: ['standard-equipment'],
      },
    }

    const selectedOption =
      storedBardWithStartingEquipment.characterCreation?.startingEquipment?.options.find(
        (option) => option.id === 'standard-equipment',
      )

    expect(
      hasUnfulfilledCategoryEquipmentNeed({
        draft,
        selectedOption,
        categoryPool,
        characterClass: storedBardWithStartingEquipment,
        catalogIndex,
        classId: storedBardWithStartingEquipment.id,
        optionId: 'standard-equipment',
      }),
    ).toBe(false)
  })

  it('returns false when the pool has no semantic categories', () => {
    expect(
      hasUnfulfilledCategoryEquipmentNeed({
        draft: createEmptyCharacterBuilderDraft(),
        selectedOption: {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 90 },
        },
        categoryPool: { source: 'any' },
        characterClass: storedBardWithStartingEquipment,
        catalogIndex,
        classId: storedBardWithStartingEquipment.id,
        optionId: 'starting-gold',
      }),
    ).toBe(false)
  })
})
