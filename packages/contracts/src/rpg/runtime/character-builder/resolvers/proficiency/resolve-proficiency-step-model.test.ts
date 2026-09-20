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

  it('returns fixed grants in the summary and interactive sections for choices', () => {
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

    expect(model.fixedGrants.map((row) => row.kind)).toEqual([
      'savingThrows',
      'tools',
      'languages',
      'weapons',
      'armor',
    ])

    const savingThrows = model.fixedGrants.find((row) => row.kind === 'savingThrows')
    expect(savingThrows?.sourceGroups).toEqual([
      expect.objectContaining({
        sourceLabel: 'Rogue',
        valueLabels: expect.arrayContaining(['Dexterity', 'Intelligence']),
      }),
    ])

    const tools = model.fixedGrants.find((row) => row.kind === 'tools')
    expect(tools?.sourceGroups).toEqual([
      expect.objectContaining({
        valueLabels: ['Thieves Tools'],
        sourceLabel: 'Rogue',
      }),
    ])

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.choiceBlocks).toHaveLength(1)
    expect(skills?.choiceBlocks[0]?.heading).toBe('Rogue Skills')
    expect(skills?.choiceBlocks[0]?.sourceLine).toBe('Rogue class')
    expect(skills?.choiceBlocks[0]?.choiceSet.label).toBe('Rogue Skills')
    expect(skills?.subhead).toBe('Choose 2 skills.')
    expect(skills?.aggregateCount).toEqual({
      selected: 0,
      max: 2,
      label: '0 / 2 chosen',
    })
    expect(model.hasPendingChoices).toBe(true)
    expect(model.hasUnresolvedPrerequisites).toBe(false)
  })

  it('marks stale skill selections on the selected rows', () => {
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
    const staleRow = skills?.selectedRows.find((row) => row.optionId === 'removed-skill')

    expect(staleRow).toMatchObject({
      isStale: true,
      staleReason: 'This proficiency is no longer available.',
    })
    expect(skills?.selectedRows.find((row) => row.optionId === stealthSkill.id)?.isStale).toBe(
      false,
    )
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
    expect(skills?.selectedRows).toEqual([
      expect.objectContaining({
        optionId: acrobaticsSkill.id,
        label: 'Acrobatics',
        sourceLabel: 'Chosen from Rogue Skills',
        isRemovable: true,
      }),
    ])
  })

  it('flags unresolved prerequisites when class progression is blocked', () => {
    const draft = createEmptyCharacterBuilderDraft()
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

    expect(model.hasUnresolvedPrerequisites).toBe(true)
    expect(model.fixedGrants.some((row) => row.kind === 'savingThrows')).toBe(false)
    expect(model.sections.some((section) => section.kind === 'languages')).toBe(true)
  })
})
