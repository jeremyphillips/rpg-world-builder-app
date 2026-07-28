import { describe, expect, it } from 'vitest'

import { characterBuilderValidationMessages } from '../character-builder-messages'
import { formatFieldMessage } from '../../../../validation/define-message'
import { abilityValidationMessages } from '../../../vocab/ability-messages'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { builderTestContext } from '../test-fixtures'
import {
  validateAbilities,
  validateClass,
  validateIdentity,
  validateSpecies,
} from './validate-step-fields'

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
})
