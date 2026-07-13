import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../classes/class'
import { indexCharacterBuildCatalog } from '../../runtime/character-builder/context'
import {
  bardClass,
  luteTool,
  proficiencyTestCatalog,
} from '../../runtime/character-builder/proficiency-test-fixtures'
import { resolveEligibleProficiencyChoiceTargets } from './resolve-eligible-proficiency-choice-targets'

const monkClass: ClassStored = {
  id: 'srd-cc-5.2.1:monk',
  slug: 'monk',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
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
  },
  features: [],
}

describe('resolveEligibleProficiencyChoiceTargets', () => {
  it('returns single-answer tool choices that resolve to equipment', () => {
    const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

    expect(resolveEligibleProficiencyChoiceTargets(monkClass, catalogIndex)).toEqual([
      {
        choiceId: 'class-tools',
        label: "Artisan's Tools or Musical Instrument",
        choose: 1,
        optionCount: 2,
      },
    ])
  })

  it('excludes multi-answer tool choices', () => {
    const multiAnswerBard: ClassStored = {
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
      },
    }
    const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

    expect(resolveEligibleProficiencyChoiceTargets(multiAnswerBard, catalogIndex)).toEqual([])
  })

  it('deduplicates choice ids within the class', () => {
    const duplicateChoiceClass: ClassStored = {
      ...monkClass,
      characterCreation: {
        proficiencies: {
          tools: {
            choices: [
              monkClass.characterCreation!.proficiencies!.tools!.choices[0]!,
              monkClass.characterCreation!.proficiencies!.tools!.choices[0]!,
            ],
          },
        },
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      ...proficiencyTestCatalog,
      equipment: [luteTool],
    })

    expect(
      resolveEligibleProficiencyChoiceTargets(duplicateChoiceClass, catalogIndex),
    ).toHaveLength(1)
  })
})
