import { describe, expect, it } from 'vitest'

import { createCharacterInputSchema } from '../character/create-input'
import { createEmptyCharacterBuilderDraft } from './draft'
import type { CharacterBuilderDraft } from './draft'
import { CharacterBuildFinalizationError, finalizeCharacterBuild } from './finalize'
import { builderTestContext } from './test-fixtures'

function makeCompleteDraft(overrides: Partial<CharacterBuilderDraft> = {}): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: { name: 'Verna', alignment: 'ng', description: 'A veteran soldier.' },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    ...overrides,
  }
}

describe('finalizeCharacterBuild', () => {
  it('returns CreateCharacterInput, never a full Character', () => {
    const input = finalizeCharacterBuild(makeCompleteDraft(), builderTestContext)

    expect(createCharacterInputSchema.safeParse(input).success).toBe(true)
    expect((input as Record<string, unknown>)['id']).toBeUndefined()
    expect((input as Record<string, unknown>)['userId']).toBeUndefined()
    expect((input as Record<string, unknown>)['createdAt']).toBeUndefined()
  })

  it('computes hitPoints.base and xp 0', () => {
    const input = finalizeCharacterBuild(makeCompleteDraft(), builderTestContext)
    expect(input.hitPoints).toEqual({ base: 11, temporary: 0 })
    expect(input.xp).toBe(0)
  })

  it('carries class proficiency sources', () => {
    const input = finalizeCharacterBuild(makeCompleteDraft(), builderTestContext)

    expect(input.proficiencies.weapons[0]?.sources).toEqual([
      {
        kind: 'classFeature',
        sourceId: 'srd-cc-5.2.1:fighter',
        grantId: 'weapon-proficiencies',
      },
    ])
    expect(input.proficiencies.armor[0]?.sources).toEqual([
      {
        kind: 'classFeature',
        sourceId: 'srd-cc-5.2.1:fighter',
        grantId: 'armor-proficiencies',
      },
    ])
  })

  it('merges skill selections with selection sources', () => {
    const input = finalizeCharacterBuild(
      makeCompleteDraft({
        choiceSelections: {
          'class:srd-cc-5.2.1:fighter:skills': ['srd-cc-5.2.1:athletics'],
        },
      }),
      builderTestContext,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:skills',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'skillProficiency',
            label: 'Choose Skills',
            min: 1,
            max: 2,
            options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
            required: true,
          },
        ],
      },
    )

    expect(input.proficiencies.skills).toEqual([
      {
        skill: 'athletics',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'class:srd-cc-5.2.1:fighter:skills',
          },
        ],
      },
    ])
  })

  it('throws CharacterBuildFinalizationError when validation fails', () => {
    expect(() =>
      finalizeCharacterBuild(createEmptyCharacterBuilderDraft(), builderTestContext),
    ).toThrow(CharacterBuildFinalizationError)
  })
})
