import { describe, expect, it } from 'vitest'

import { buildChoiceSetId } from '../../choice-set'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import {
  bardClass,
  fluteTool,
  luteTool,
  monkClass,
  proficiencyTestCatalog,
} from '../../proficiency-test-fixtures'
import {
  PROFICIENCY_LINKED_GRANT_INVALID_ANSWER_COUNT_MESSAGE,
  PROFICIENCY_LINKED_GRANT_INVALID_OPTION_MESSAGE,
  PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE,
  resolveClassToolProficiencyChoice,
  resolveProficiencyLinkedEquipmentGrant,
} from './resolve-proficiency-linked-equipment-grant'

const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

const monkToolChoiceSetId = buildChoiceSetId('class', monkClass.id, 'class-tools')
const bardToolChoiceSetId = buildChoiceSetId('class', bardClass.id, 'class-tools')

describe('resolveClassToolProficiencyChoice', () => {
  it('resolves the referenced choice on the owning class', () => {
    const resolved = resolveClassToolProficiencyChoice(monkClass, 'class-tools', catalogIndex)

    expect(resolved?.choice.id).toBe('class-tools')
    expect(resolved?.options.map((option) => option.id)).toEqual([fluteTool.id, luteTool.id])
  })

  it('returns undefined for a missing local choice id', () => {
    expect(resolveClassToolProficiencyChoice(monkClass, 'missing', catalogIndex)).toBeUndefined()
  })
})

describe('resolveProficiencyLinkedEquipmentGrant', () => {
  it('returns pending when the proficiency answer is missing', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {},
    }

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({ status: 'pending' })
  })

  it('returns resolved when the answer maps to catalog equipment', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [monkToolChoiceSetId]: [luteTool.id],
      },
    }

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({
      status: 'resolved',
      equipmentId: luteTool.id,
      equipment: luteTool,
    })
  })

  it('rejects answers outside the referenced ChoiceSet options', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [monkToolChoiceSetId]: ['srd-cc-5.2.1:missing-tool'],
      },
    }

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_INVALID_OPTION_MESSAGE,
    })
  })

  it('rejects malformed answer counts', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [monkToolChoiceSetId]: [luteTool.id, fluteTool.id],
      },
    }

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_INVALID_ANSWER_COUNT_MESSAGE,
    })
  })

  it('scopes answers to the owning class id for multiclass collisions', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [bardToolChoiceSetId]: [luteTool.id],
      },
    }

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({ status: 'pending' })

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: bardClass.id, choiceId: 'class-tools' },
        draft,
        characterClass: bardClass,
        catalogIndex,
      }),
    ).toEqual({
      status: 'resolved',
      equipmentId: luteTool.id,
      equipment: luteTool,
    })
  })

  it('returns invalid when the linked choice is missing on the class', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveProficiencyLinkedEquipmentGrant({
        source: { ownerType: 'class', ownerId: monkClass.id, choiceId: 'missing' },
        draft,
        characterClass: monkClass,
        catalogIndex,
      }),
    ).toEqual({
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE,
    })
  })
})
