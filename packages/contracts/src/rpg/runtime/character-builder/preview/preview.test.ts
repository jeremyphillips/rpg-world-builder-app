import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import { indexCharacterBuildCatalog } from '../context'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuilderDraft } from '../draft/draft'
import { buildCharacterPreview } from './preview'
import { builderTestCatalog, builderTestRules, storedFighter } from '../test-fixtures'

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

const RULESET_ID = 'srd-cc-5.2.1' as const

describe('buildCharacterPreview', () => {
  it('does not throw on an empty draft', () => {
    expect(() =>
      buildCharacterPreview(
        createEmptyCharacterBuilderDraft(),
        indexCharacterBuildCatalog(builderTestCatalog),
        builderTestRules,
        RULESET_ID,
      ),
    ).not.toThrow()
  })

  it('returns baseline preview stats without class or DEX', () => {
    const preview = buildCharacterPreview(
      createEmptyCharacterBuilderDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.maxHp).toBeUndefined()
    expect(preview.ac).toBe(10)
    expect(preview.proficiencyBonus).toBe(2)
  })

  it('returns partial preview without class-selected HP', () => {
    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        abilities: { method: 'manual', scores: { dex: 14 } },
      },
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.maxHp).toBeUndefined()
    expect(preview.ac).toBe(12)
    expect(preview.proficiencyBonus).toBe(2)
  })

  it('derives hit die max HP when class is selected before abilities', () => {
    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      },
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.maxHp).toBe(10)
    expect(preview.ac).toBe(10)
  })

  it('derives level-1 fighter stats from a complete draft', () => {
    const preview = buildCharacterPreview(
      makeCompleteDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      RULESET_ID,
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
      RULESET_ID,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:class-skills',
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

    expect(preview.unresolvedChoiceSetIds).toEqual(['class:srd-cc-5.2.1:fighter:class-skills'])
  })

  it('returns advisory warnings only for non-blocking recommendations', () => {
    const preview = buildCharacterPreview(
      createEmptyCharacterBuilderDraft(),
      indexCharacterBuildCatalog(builderTestCatalog),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.warnings).toEqual([])
  })

  it('surfaces unarmored defense when no body armor is equipped', () => {
    const catalogWithUnarmoredDefense = {
      ...builderTestCatalog,
      classes: [
        {
          ...storedFighter,
          features: [
            {
              kind: 'custom' as const,
              id: 'unarmored-defense',
              name: 'Unarmored Defense',
              level: 1,
              description: 'AC without armor.',
            },
          ],
        },
      ],
    }

    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      },
      indexCharacterBuildCatalog(catalogWithUnarmoredDefense),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.warnings.some((warning) => warning.includes('Unarmored Defense'))).toBe(true)
  })

  it('marks retained purchases as pending without listing them while starting equipment is unresolved', () => {
    const rope = equipmentSchema.parse({
      rulesetId: RULESET_ID,
      source: 'system',
      status: 'published',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      id: 'srd-cc-5.2.1:rope',
      slug: 'rope',
      name: 'Rope',
      description: '',
      cost: { amount: 1, currency: 'gp' },
      weight: { value: 5, unit: 'lb' },
      kind: 'adventuring_gear',
      gearKind: 'consumable',
    })

    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
        equipment: {
          mode: 'package',
          purchases: [
            {
              equipmentId: rope.id,
              quantity: 1,
              sourceMode: 'startingGold',
              origin: 'picker',
            },
          ],
          editedSincePackageSelection: false,
        },
      },
      indexCharacterBuildCatalog({
        ...builderTestCatalog,
        classes: builderTestCatalog.classes.map((characterClass) =>
          characterClass.id === 'srd-cc-5.2.1:fighter'
            ? {
                ...characterClass,
                characterCreation: {
                  startingEquipment: {
                    choose: 1,
                    options: [
                      {
                        id: 'starting-gold',
                        label: 'Starting Gold',
                        items: [],
                        wealth: { gp: 50 },
                      },
                    ],
                  },
                },
              }
            : characterClass,
        ),
        equipment: [rope],
      }),
      builderTestRules,
      RULESET_ID,
    )

    expect(preview.equipmentSummary).toEqual([])
    expect(preview.startingEquipmentPending).toBe(true)
  })
})
