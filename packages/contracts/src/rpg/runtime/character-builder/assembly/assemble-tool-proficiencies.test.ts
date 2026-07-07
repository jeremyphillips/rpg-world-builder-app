import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { assembleToolProficiencyEntries } from './assemble-tool-proficiencies'
import { resolveClassToolChoiceSets } from '../resolvers/class/resolve-class-tool-choice-sets'
import {
  bardClass,
  luteTool,
  proficiencyTestCatalog,
  rogueClass,
} from '../proficiency-test-fixtures'

describe('assembleToolProficiencyEntries', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('returns class-fixed tool proficiencies with provenance', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
    }

    expect(assembleToolProficiencyEntries(draft, catalogIndex, [], rogueClass)).toEqual([
      {
        toolId: 'thieves-tools',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: rogueClass.id,
            grantId: 'tool-proficiencies',
          },
        ],
      },
    ])
  })

  it('finalizes selected tool ChoiceSet picks with choice provenance', () => {
    const choiceSets = resolveClassToolChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: bardClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: bardClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [luteTool.id],
      },
    }

    expect(assembleToolProficiencyEntries(draft, catalogIndex, choiceSets, bardClass)).toEqual([
      {
        toolId: 'lute',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: bardClass.id,
            grantId: choiceSets[0]!.id,
          },
        ],
      },
    ])
  })

  it('merges duplicate tool sources when a fixed grant overlaps a selection', () => {
    const choiceSets = resolveClassToolChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: bardClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: bardClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [luteTool.id],
      },
    }
    const bardWithFixedLute = {
      ...bardClass,
      proficiencies: {
        ...bardClass.proficiencies,
        tools: { categories: [], items: ['lute'] },
      },
    }

    expect(
      assembleToolProficiencyEntries(draft, catalogIndex, choiceSets, bardWithFixedLute),
    ).toEqual([
      {
        toolId: 'lute',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: bardClass.id,
            grantId: 'tool-proficiencies',
          },
          {
            kind: 'classFeature',
            sourceId: bardClass.id,
            grantId: choiceSets[0]!.id,
          },
        ],
      },
    ])
  })

  it('returns an empty list when no class is selected', () => {
    expect(
      assembleToolProficiencyEntries(
        createEmptyCharacterBuilderDraft(),
        catalogIndex,
        [],
        undefined,
      ),
    ).toEqual([])
  })
})
