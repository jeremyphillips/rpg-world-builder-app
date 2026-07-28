import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { indexCharacterBuildCatalog } from '../context'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import { resolveClassToolChoiceSets } from '../resolvers/class/resolve-class-tool-choice-sets'
import {
  bardClass,
  fluteTool,
  proficiencyTestCatalog,
  rogueClass,
} from '../proficiency-test-fixtures'

describe('assembleCharacterProficiencies', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('assembles class-fixed tool proficiencies for Rogue', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
    }

    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], rogueClass)

    expect(proficiencies.tools).toEqual([
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

  it('assembles selected tool proficiencies through the aggregate orchestrator', () => {
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
        [choiceSets[0]!.id]: [fluteTool.id],
      },
    }

    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, choiceSets, bardClass)

    expect(proficiencies.tools).toEqual([
      {
        toolId: 'flute',
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
})
