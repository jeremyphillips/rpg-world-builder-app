import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { validateProficiencyChoiceSets } from './validate-choice-sets'
import { resolveClassSkillChoiceSets } from '../resolvers/class/resolve-class-skill-choice-sets'
import { proficiencyTestCatalog, rogueClass } from '../proficiency-test-fixtures'

describe('validateProficiencyChoiceSets', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('reports stale proficiency selections', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: ['removed-skill'],
      },
    }

    const issues = validateProficiencyChoiceSets(draft, choiceSets, catalogIndex)

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'proficiency_no_longer_available',
        stepId: 'proficiencies',
        choiceSetId: choiceSets[0]!.id,
        message: 'removed-skill is no longer available.',
      }),
    ])
  })
})
