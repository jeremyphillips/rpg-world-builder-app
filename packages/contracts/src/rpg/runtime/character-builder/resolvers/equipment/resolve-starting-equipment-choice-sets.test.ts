import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { validateChoiceSets } from '../../validate/validate-choice-sets'
import {
  resolveStartingEquipmentChoiceSets,
  resolveStartingEquipmentResolution,
  startingEquipmentChoiceSetId,
} from './resolve-starting-equipment-choice-sets'

const RULESET = 'srd-cc-5.2.1' as const

const storedClass: ClassStored = {
  id: `${RULESET}:limited-equipment`,
  slug: 'limited-equipment',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Limited Equipment',
  primaryAbilities: ['str'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 2,
      options: [
        { id: 'standard-equipment', label: 'Standard Equipment', items: [], wealth: { gp: 10 } },
        { id: 'alt-package', label: 'Alt Package', available: false, items: [], wealth: { gp: 5 } },
        { id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 50 } },
      ],
    },
  },
}

describe('resolveStartingEquipmentChoiceSets', () => {
  it('documents choice_set_unsatisfied when choose exceeds campaign-available options', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedClass],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedClass.id, level: 1 as const },
    }

    const [startingChoiceSet] = resolveStartingEquipmentChoiceSets(draft, storedClass, catalogIndex)

    expect(startingChoiceSet).toMatchObject({
      id: startingEquipmentChoiceSetId(storedClass.id),
      min: 2,
      max: 2,
      options: [{ id: 'standard-equipment' }, { id: 'starting-gold' }],
    })

    const issues = validateChoiceSets(draft, [startingChoiceSet!])
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'choice_set_unsatisfied', stepId: 'equipment' }),
    )
  })

  it('omits nested choice sets when the selected package is campaign-unavailable', () => {
    const classWithNestedChoice: ClassStored = {
      ...storedClass,
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  id: 'simple-choice',
                  kind: 'choice',
                  choose: 1,
                  pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'simple' },
                },
              ],
            },
            {
              id: 'alt-package',
              label: 'Alt Package',
              available: false,
              items: [
                {
                  id: 'simple-choice',
                  kind: 'choice',
                  choose: 1,
                  pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'simple' },
                },
              ],
            },
          ],
        },
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [classWithNestedChoice],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: classWithNestedChoice.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classWithNestedChoice.id)]: ['alt-package'],
      },
    }

    const choiceSets = resolveStartingEquipmentChoiceSets(
      draft,
      classWithNestedChoice,
      catalogIndex,
    )

    expect(choiceSets).toHaveLength(1)
  })
})

describe('resolveStartingEquipmentResolution', () => {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [storedClass],
    spells: [],
    equipment: [],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })
  const classDraft = {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: storedClass.id, level: 1 as const },
  }
  const ropePurchase = {
    equipmentId: `${RULESET}:rope`,
    quantity: 1,
    sourceMode: 'startingGold' as const,
    origin: 'picker' as const,
  }

  it('is notApplicable without a class or without starting options', () => {
    expect(
      resolveStartingEquipmentResolution(createEmptyCharacterBuilderDraft(), catalogIndex),
    ).toBe('notApplicable')
    expect(
      resolveStartingEquipmentResolution(
        { ...classDraft, class: { classId: `${RULESET}:unknown`, level: 1 } },
        catalogIndex,
      ),
    ).toBe('notApplicable')
  })

  it('is unresolvedEmpty when no option is selected and no purchases exist', () => {
    expect(resolveStartingEquipmentResolution(classDraft, catalogIndex)).toBe('unresolvedEmpty')
  })

  it('is unresolvedWithPurchases when no option is selected but purchases are retained', () => {
    const draft = {
      ...classDraft,
      equipment: {
        mode: 'package' as const,
        purchases: [ropePurchase],
        editedSincePackageSelection: false,
      },
    }
    expect(resolveStartingEquipmentResolution(draft, catalogIndex)).toBe('unresolvedWithPurchases')
  })

  it('is selected when an option is selected', () => {
    const draft = {
      ...classDraft,
      choiceSelections: { [startingEquipmentChoiceSetId(storedClass.id)]: ['starting-gold'] },
      equipment: {
        mode: 'gold' as const,
        purchases: [ropePurchase],
        editedSincePackageSelection: false,
      },
    }
    expect(resolveStartingEquipmentResolution(draft, catalogIndex)).toBe('selected')
  })
})
