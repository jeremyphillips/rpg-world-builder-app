import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from './context'
import { createEmptyCharacterBuilderDraft } from './draft'
import type { CharacterBuilderDraft } from './draft'
import { buildCharacterPreview } from './preview'
import { builderTestCatalog, builderTestRules } from './test-fixtures'

function makeCompleteDraft(overrides: Partial<CharacterBuilderDraft> = {}): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: { name: 'Verna', alignment: 'ng' },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    ...overrides,
  }
}

describe('buildCharacterPreview', () => {
  it('does not throw on an empty draft', () => {
    expect(() =>
      buildCharacterPreview(
        createEmptyCharacterBuilderDraft(),
        indexCharacterBuildCatalog(builderTestCatalog),
        builderTestRules,
      ),
    ).not.toThrow()
  })

  it('returns partial preview without class-selected HP/AC', () => {
    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        abilities: { method: 'manual', scores: { dex: 14 } },
      },
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
    )

    expect(preview.maxHp).toBeUndefined()
    expect(preview.ac).toBe(12)
    expect(preview.proficiencyBonus).toBeUndefined()
  })

  it('derives level-1 fighter stats from a complete draft', () => {
    const preview = buildCharacterPreview(
      makeCompleteDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
    )

    expect(preview.proficiencyBonus).toBe(2)
    expect(preview.maxHp).toBe(11) // d10 + CON mod (+1)
    expect(preview.ac).toBe(12) // 10 + DEX mod (+2)
    expect(preview.abilityScores.str).toEqual({ score: 15, modifier: 2 })
    expect(preview.savingThrows.find((save) => save.ability === 'str')).toMatchObject({
      proficient: true,
      bonus: 4,
    })
    expect(preview.proficiencies.weapons).toHaveLength(2)
    expect(preview.proficiencies.armor).toHaveLength(2)
    expect(preview.spellcasting).toBeNull()
  })

  it('lists unresolved required ChoiceSet ids', () => {
    const preview = buildCharacterPreview(
      makeCompleteDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:skills',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'skillProficiency',
            label: 'Choose Skills',
            min: 2,
            max: 2,
            options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
            required: true,
          },
        ],
      },
    )

    expect(preview.unresolvedChoiceSetIds).toEqual(['class:srd-cc-5.2.1:fighter:skills'])
  })

  it('surfaces advisory warnings for incomplete drafts', () => {
    const preview = buildCharacterPreview(
      createEmptyCharacterBuilderDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
    )

    expect(preview.warnings).toContain('Name is not set.')
    expect(preview.warnings).toContain('Species is not selected.')
    expect(preview.warnings).toContain('Class is not selected.')
  })
})
