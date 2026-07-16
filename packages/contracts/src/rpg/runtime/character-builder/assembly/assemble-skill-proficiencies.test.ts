import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { assembleSkillProficiencyEntries } from './assemble-skill-proficiencies'
import { resolveClassSkillChoiceSets } from '../resolvers/class/resolve-class-skill-choice-sets'
import { athleticsSkill, builderTestCatalog, fighterClass } from '../test-fixtures'

describe('assembleSkillProficiencyEntries', () => {
  const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

  it('returns class-fixed skill proficiencies and ChoiceSet selections with sources', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: fighterClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: fighterClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [athleticsSkill.id],
      },
    }

    expect(assembleSkillProficiencyEntries(draft, catalogIndex, choiceSets, fighterClass)).toEqual([
      {
        skill: 'athletics',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: fighterClass.id,
            grantId: choiceSets[0]!.id,
          },
        ],
      },
    ])
  })

  it('returns an empty list when no class is selected', () => {
    expect(
      assembleSkillProficiencyEntries(
        createEmptyCharacterBuilderDraft(),
        catalogIndex,
        [],
        undefined,
      ),
    ).toEqual([])
  })

  it('merges duplicate skill sources like language proficiency assembly', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: fighterClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: fighterClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [athleticsSkill.id],
      },
    }

    const fighterWithFixedAthletics = {
      ...fighterClass,
      proficiencies: {
        ...fighterClass.proficiencies,
        skills: { categories: [], items: ['athletics'] },
      },
    }

    expect(
      assembleSkillProficiencyEntries(draft, catalogIndex, choiceSets, fighterWithFixedAthletics),
    ).toEqual([
      {
        skill: 'athletics',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: fighterClass.id,
            grantId: 'skill-proficiencies',
          },
          {
            kind: 'classFeature',
            sourceId: fighterClass.id,
            grantId: choiceSets[0]!.id,
          },
        ],
      },
    ])
  })
})
