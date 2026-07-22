import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../classes/class'
import { indexCharacterBuildCatalog } from '../../runtime/character-builder/context'
import {
  bardClass,
  luteTool,
  proficiencyTestCatalog,
} from '../../runtime/character-builder/proficiency-test-fixtures'
import {
  findStartingEquipmentGrantsReferencingProficiencyChoice,
  validateStartingEquipmentProficiencyLinks,
} from './validate-starting-equipment-proficiency-links'

const monkWithLinkedGrant: ClassStored = {
  id: 'srd-cc-5.2.1:monk',
  slug: 'monk',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Monk',
  primaryAbilities: ['dex', 'wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'dex'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: "Artisan's Tools or Musical Instrument",
            choose: 1,
            pool: {
              source: 'filtered',
              toolCategories: ['artisan', 'musical_instrument'],
            },
          },
        ],
      },
    },
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
          ],
        },
        {
          id: 'alternate',
          label: 'Alternate Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
          ],
        },
      ],
    },
  },
  features: [],
}

describe('validateStartingEquipmentProficiencyLinks', () => {
  it('returns no issues for a valid linked grant when the choice resolves', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      ...proficiencyTestCatalog,
      classes: [monkWithLinkedGrant],
      equipment: [luteTool],
    })

    expect(validateStartingEquipmentProficiencyLinks(monkWithLinkedGrant, catalogIndex)).toEqual([])
  })

  it('flags missing proficiency choices', () => {
    const brokenClass: ClassStored = {
      ...monkWithLinkedGrant,
      characterCreation: {
        ...monkWithLinkedGrant.characterCreation,
        proficiencies: undefined,
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      ...proficiencyTestCatalog,
      classes: [brokenClass],
      equipment: [luteTool],
    })

    expect(validateStartingEquipmentProficiencyLinks(brokenClass, catalogIndex)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing_choice',
          choiceId: 'class-tools',
          optionId: 'standard-equipment',
        }),
        expect.objectContaining({
          code: 'missing_choice',
          choiceId: 'class-tools',
          optionId: 'alternate',
        }),
      ]),
    )
  })

  it('flags ineligible proficiency choices', () => {
    const bardWithLinkedGrant: ClassStored = {
      ...bardClass,
      characterCreation: {
        proficiencies: {
          tools: {
            choices: [
              {
                id: 'class-tools',
                label: 'Bard Tools',
                choose: 3,
                pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
              },
            ],
          },
        },
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'proficiency_choice', choiceId: 'class-tools' },
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      ...proficiencyTestCatalog,
      classes: [bardWithLinkedGrant],
      equipment: [luteTool],
    })

    expect(
      validateStartingEquipmentProficiencyLinks(bardWithLinkedGrant, catalogIndex),
    ).toMatchObject([{ code: 'ineligible_choice', choiceId: 'class-tools' }])
  })

  it('flags duplicate links within the same package only', () => {
    const duplicateInPackage: ClassStored = {
      ...monkWithLinkedGrant,
      characterCreation: {
        ...monkWithLinkedGrant.characterCreation!,
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'proficiency_choice', choiceId: 'class-tools' },
                  quantity: 1,
                },
                {
                  kind: 'grant',
                  target: { source: 'proficiency_choice', choiceId: 'class-tools' },
                  quantity: 1,
                },
              ],
            },
            {
              id: 'alternate',
              label: 'Alternate Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'proficiency_choice', choiceId: 'class-tools' },
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      ...proficiencyTestCatalog,
      classes: [duplicateInPackage],
      equipment: [luteTool],
    })

    const issues = validateStartingEquipmentProficiencyLinks(duplicateInPackage, catalogIndex)
    expect(
      issues.some(
        (issue) => issue.code === 'duplicate_link' && issue.optionId === 'standard-equipment',
      ),
    ).toBe(true)
    expect(
      issues.some((issue) => issue.code === 'duplicate_link' && issue.optionId === 'alternate'),
    ).toBe(false)
  })

  it('flags modifiers on proficiency-linked grants', () => {
    const withModifiers: ClassStored = {
      ...monkWithLinkedGrant,
      characterCreation: {
        ...monkWithLinkedGrant.characterCreation!,
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'proficiency_choice', choiceId: 'class-tools' },
                  quantity: 1,
                  modifiers: [
                    { kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    expect(
      validateStartingEquipmentProficiencyLinks(
        withModifiers,
        indexCharacterBuildCatalog({
          ...proficiencyTestCatalog,
          classes: [withModifiers],
          equipment: [luteTool],
        }),
      ),
    ).toMatchObject([{ code: 'modifiers_not_allowed' }])
  })
})

describe('findStartingEquipmentGrantsReferencingProficiencyChoice', () => {
  it('returns package rows that reference a proficiency choice id', () => {
    expect(
      findStartingEquipmentGrantsReferencingProficiencyChoice(monkWithLinkedGrant, 'class-tools'),
    ).toEqual([
      { optionId: 'standard-equipment', itemIndex: 0 },
      { optionId: 'alternate', itemIndex: 0 },
    ])
  })
})
