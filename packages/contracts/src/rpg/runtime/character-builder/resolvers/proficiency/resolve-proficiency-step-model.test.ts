import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { buildCharacterPreview } from '../../preview/preview'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { resolveClassSkillChoiceSets } from '../class/resolve-class-skill-choice-sets'
import { resolveProficiencyStepModel } from './resolve-proficiency-step-model'
import {
  acrobaticsSkill,
  proficiencyTestCatalog,
  proficiencyTestContext,
  rogueClass,
  stealthSkill,
} from '../../proficiency-test-fixtures'

describe('resolveProficiencyStepModel', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)
  const rules = proficiencyTestContext.characterCreationRules
  const rulesetId = proficiencyTestContext.rulesetId

  it('returns Rogue sections with saving throws, grants, and skill choices', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {},
    }
    const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    expect(model.sections.map((section) => section.kind)).toEqual([
      'savingThrows',
      'skills',
      'tools',
      'languages',
      'weapons',
      'armor',
    ])

    const savingThrows = model.sections.find((section) => section.kind === 'savingThrows')
    expect(savingThrows?.grantedRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'DEX · Dexterity',
          sourceLabel: 'Granted by Rogue',
        }),
        expect.objectContaining({
          label: 'INT · Intelligence',
          sourceLabel: 'Granted by Rogue',
        }),
      ]),
    )

    const tools = model.sections.find((section) => section.kind === 'tools')
    expect(tools?.grantedRows).toEqual([
      expect.objectContaining({
        label: 'Thieves Tools',
        sourceLabel: 'Granted by Rogue',
      }),
    ])

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.choices).toHaveLength(1)
    expect(skills?.choices[0]?.choiceSet.label).toBe('Rogue Skills')
    expect(model.hasPendingChoices).toBe(true)
  })

  it('marks stale skill selections on the choice summary', () => {
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
        [choiceSets[0]!.id]: [stealthSkill.id, 'removed-skill'],
      },
    }
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    const staleRow = skills?.choices[0]?.selectedRows.find(
      (row) => row.optionId === 'removed-skill',
    )

    expect(staleRow).toMatchObject({
      isStale: true,
      staleReason: 'This proficiency is no longer available.',
    })
    expect(
      skills?.choices[0]?.selectedRows.find((row) => row.optionId === stealthSkill.id)?.isStale,
    ).toBe(false)
  })

  it('includes selected skill rows with choice provenance labels', () => {
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
        [choiceSets[0]!.id]: [acrobaticsSkill.id],
      },
    }
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.choices[0]?.selectedRows).toEqual([
      expect.objectContaining({
        optionId: acrobaticsSkill.id,
        label: 'Acrobatics',
        sourceLabel: 'Chosen from Rogue Skills',
        isRemovable: true,
      }),
    ])
  })
})
