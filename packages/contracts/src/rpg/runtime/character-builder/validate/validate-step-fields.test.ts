import { describe, expect, it } from 'vitest'

import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { formatFieldMessage } from '../../../../validation/define-message'
import { abilityValidationMessages } from '../../../vocab/ability-messages'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { builderTestContext } from '../test-fixtures'
import {
  validateAbilities,
  validateClass,
  validateIdentity,
  validateSpecies,
} from './validate-step-fields'

const PC_ARRAY = [16, 14, 13, 12, 10, 8] as const
const L0_ARRAY = [12, 11, 10, 9, 8, 7] as const

const l0NpcScores = { str: 12, dex: 11, con: 10, int: 9, wis: 8, cha: 7 } as const
const pcScores = { str: 16, dex: 14, con: 13, int: 12, wis: 10, cha: 8 } as const

describe('validate-step-fields', () => {
  it('validateIdentity reports friendly name copy', () => {
    const issues = validateIdentity(createEmptyCharacterBuilderDraft(), false)

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'name_required',
        message: formatFieldMessage(characterBuilderValidationMessages.nameRequired()),
        stepId: 'identity',
      }),
    ])
  })

  it('validateIdentity requires alignment only when requested', () => {
    const withoutAlignment = validateIdentity(
      { ...createEmptyCharacterBuilderDraft(), identity: { name: 'Verna' } },
      false,
    )
    expect(withoutAlignment.some((issue) => issue.code === 'alignment_required')).toBe(false)

    const withAlignment = validateIdentity(
      { ...createEmptyCharacterBuilderDraft(), identity: { name: 'Verna' } },
      true,
    )
    expect(withAlignment).toEqual([
      expect.objectContaining({
        code: 'alignment_required',
        message: formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()),
      }),
    ])
  })

  it('validateSpecies reports species required', () => {
    const issues = validateSpecies(createEmptyCharacterBuilderDraft())

    expect(issues[0]).toEqual(
      expect.objectContaining({
        code: 'species_required',
        message: formatFieldMessage(characterBuilderValidationMessages.speciesRequired()),
      }),
    )
  })

  it('validateClass reports class required', () => {
    const issues = validateClass(createEmptyCharacterBuilderDraft())

    expect(issues[0]).toEqual(
      expect.objectContaining({
        code: 'class_required',
        message: formatFieldMessage(characterBuilderValidationMessages.classRequired()),
      }),
    )
  })

  it('validateAbilities reports incomplete and out-of-range scores', () => {
    const incomplete = validateAbilities(
      {
        ...createEmptyCharacterBuilderDraft(),
        abilities: { method: 'manual', scores: { str: 15 } },
      },
      builderTestContext.characterCreationRules.abilityGeneration.standardArray,
    )

    expect(incomplete[0]?.code).toBe('abilities_incomplete')

    const outOfRange = validateAbilities(
      {
        ...createEmptyCharacterBuilderDraft(),
        abilities: {
          method: 'manual',
          scores: { str: 0, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      },
      builderTestContext.characterCreationRules.abilityGeneration.standardArray,
    )

    expect(outOfRange[0]?.message).toBe(
      formatFieldMessage(abilityValidationMessages.characterScoreOutOfRange({ min: 1, max: 20 })),
    )
  })

  it('validateAbilities accepts L0 array assignment for level 0 NPC scores', () => {
    const issues = validateAbilities(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { level: 0 },
        abilities: { method: 'standard-array', scores: { ...l0NpcScores } },
      },
      [...L0_ARRAY],
    )

    expect(issues).toEqual([])
  })

  it('validateAbilities rejects PC array assignment when L0 array is required', () => {
    const issues = validateAbilities(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { level: 0 },
        abilities: { method: 'standard-array', scores: { ...pcScores } },
      },
      [...L0_ARRAY],
    )

    expect(issues.some((issue) => issue.code === 'standard_array_exact_assignment')).toBe(true)
  })

  it('validateAbilities rejects L0 array assignment when PC array is required', () => {
    const issues = validateAbilities(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { level: 1 },
        abilities: { method: 'standard-array', scores: { ...l0NpcScores } },
      },
      [...PC_ARRAY],
    )

    expect(issues.some((issue) => issue.code === 'standard_array_exact_assignment')).toBe(true)
  })
})
