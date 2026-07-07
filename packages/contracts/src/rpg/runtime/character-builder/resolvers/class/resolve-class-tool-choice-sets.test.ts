import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import { resolveClassToolChoiceSets } from './resolve-class-tool-choice-sets'
import {
  bardClass,
  fluteTool,
  luteTool,
  proficiencyTestCatalog,
} from '../../proficiency-test-fixtures'

describe('resolveClassToolChoiceSets', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('returns no ChoiceSets when no class is selected', () => {
    expect(resolveClassToolChoiceSets(createEmptyCharacterBuilderDraft(), catalogIndex)).toEqual([])
  })

  it('returns no ChoiceSets for classes without tool proficiency choices', () => {
    expect(
      resolveClassToolChoiceSets(
        {
          ...createEmptyCharacterBuilderDraft(),
          class: { classId: 'srd-cc-5.2.1:rogue', level: 1 },
        },
        catalogIndex,
      ),
    ).toEqual([])
  })

  it('builds a tool proficiency ChoiceSet from characterCreation.proficiencies.tools', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: bardClass.id, level: 1 as const },
    }

    expect(resolveClassToolChoiceSets(draft, catalogIndex)).toEqual([
      {
        id: `class:${bardClass.id}:class-tools`,
        sourceType: 'class',
        sourceId: bardClass.id,
        choiceType: 'toolProficiency',
        label: 'Bard Tools',
        min: 1,
        max: 1,
        options: [
          { id: luteTool.id, label: 'Lute' },
          { id: fluteTool.id, label: 'Flute' },
        ],
        required: true,
      },
    ])
  })
})
