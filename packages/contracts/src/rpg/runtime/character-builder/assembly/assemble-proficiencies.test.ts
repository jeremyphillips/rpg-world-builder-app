import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import { proficiencyTestCatalog, rogueClass } from '../proficiency-test-fixtures'

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
})
