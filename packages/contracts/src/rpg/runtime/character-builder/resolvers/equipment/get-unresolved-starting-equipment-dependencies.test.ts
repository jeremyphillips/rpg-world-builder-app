import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { buildChoiceSetId } from '../../choice-set'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import {
  getInvalidStartingEquipmentProficiencyLinks,
  getUnresolvedStartingEquipmentDependencies,
} from './get-unresolved-starting-equipment-dependencies'
import {
  fluteTool,
  luteTool,
  monkClass,
  proficiencyTestCatalog,
} from '../../proficiency-test-fixtures'

const monkWithLinkedGrant: ClassStored = {
  ...monkClass,
  characterCreation: {
    ...monkClass.characterCreation,
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
  classes: [monkWithLinkedGrant],
})

const monkToolChoiceSetId = buildChoiceSetId('class', monkWithLinkedGrant.id, 'class-tools')

describe('getUnresolvedStartingEquipmentDependencies', () => {
  const option = monkWithLinkedGrant.characterCreation!.startingEquipment!.options[0]!

  it('returns pending proficiency ChoiceSet dependencies without using preview assembly', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: monkWithLinkedGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkWithLinkedGrant.id)]: ['standard-equipment'],
      },
    }

    expect(
      getUnresolvedStartingEquipmentDependencies({
        option,
        classId: monkWithLinkedGrant.id,
        characterClass: monkWithLinkedGrant,
        choiceSelections: draft.choiceSelections,
        catalogIndex,
      }),
    ).toEqual([
      {
        choiceSetId: monkToolChoiceSetId,
        choiceId: 'class-tools',
        label: "Artisan's Tools or Musical Instrument",
      },
    ])
  })

  it('returns no pending dependencies after the proficiency answer is set', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: monkWithLinkedGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkWithLinkedGrant.id)]: ['standard-equipment'],
        [monkToolChoiceSetId]: [luteTool.id],
      },
    }

    expect(
      getUnresolvedStartingEquipmentDependencies({
        option,
        classId: monkWithLinkedGrant.id,
        characterClass: monkWithLinkedGrant,
        choiceSelections: draft.choiceSelections,
        catalogIndex,
      }),
    ).toEqual([])
  })
})

describe('getInvalidStartingEquipmentProficiencyLinks', () => {
  const option = monkWithLinkedGrant.characterCreation!.startingEquipment!.options[0]!

  it('reports invalid answers separately from pending dependencies', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [monkToolChoiceSetId]: [luteTool.id, fluteTool.id],
      },
    }

    expect(
      getInvalidStartingEquipmentProficiencyLinks({
        option,
        classId: monkWithLinkedGrant.id,
        characterClass: monkWithLinkedGrant,
        choiceSelections: draft.choiceSelections,
        catalogIndex,
      }),
    ).toEqual([
      {
        choiceId: 'class-tools',
        issue: 'Proficiency choice must have exactly one selected option.',
      },
    ])
  })
})
