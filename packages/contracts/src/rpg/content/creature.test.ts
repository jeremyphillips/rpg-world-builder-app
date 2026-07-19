import { describe, expect, it } from 'vitest'

import { characterSchema } from '../runtime/character/sheet'
import {
  creatureAbilityScoresSchema,
  creatureRuntimeHitPointsSchema,
  creatureSavingThrowModifierEntrySchema,
  creatureSensesSchema,
  creatureSkillModifierEntrySchema,
  creatureMovementSchema,
  creatureStatBlockHitPointsSchema,
} from './creature'

describe('creatureAbilityScoresSchema', () => {
  it('accepts monster-scale ability scores', () => {
    expect(
      creatureAbilityScoresSchema.parse({
        str: 30,
        dex: 14,
        con: 28,
        int: 18,
        wis: 16,
        cha: 24,
      }),
    ).toEqual({
      str: 30,
      dex: 14,
      con: 28,
      int: 18,
      wis: 16,
      cha: 24,
    })
  })

  it('rejects scores above the shared creature ceiling', () => {
    expect(
      creatureAbilityScoresSchema.safeParse({
        str: 31,
        dex: 14,
        con: 28,
        int: 18,
        wis: 16,
        cha: 24,
      }).success,
    ).toBe(false)
  })
})

describe('creature hit point schemas', () => {
  it('parses runtime hit points for owned sheets or encounter state', () => {
    expect(creatureRuntimeHitPointsSchema.parse({ base: 42, current: 40, temporary: 5 })).toEqual({
      base: 42,
      current: 40,
      temporary: 5,
    })
  })

  it('rejects current hit points above base', () => {
    expect(
      creatureRuntimeHitPointsSchema.safeParse({ base: 10, current: 11, temporary: 0 }).success,
    ).toBe(false)
  })

  it('parses monster stat-block hit points with an optional formula', () => {
    expect(creatureStatBlockHitPointsSchema.parse({ average: 45, formula: '6d8 + 18' })).toEqual({
      average: 45,
      formula: '6d8 + 18',
    })
  })
})

describe('creature movement and senses', () => {
  it('uses existing creature movement and sense vocabulary', () => {
    expect(
      creatureMovementSchema.parse({
        walk: 30,
        fly: 60,
      }),
    ).toEqual({
      walk: 30,
      fly: 60,
    })

    expect(creatureSensesSchema.parse([{ type: 'darkvision', range: 60 }])).toEqual([
      { type: 'darkvision', range: 60 },
    ])
  })

  it('defaults omitted senses to an empty list', () => {
    expect(creatureSensesSchema.parse(undefined)).toEqual([])
  })
})

describe('creature stat-block modifier entries', () => {
  it('parses explicit skill and saving throw modifiers', () => {
    expect(creatureSkillModifierEntrySchema.parse({ skill: 'perception', modifier: 7 })).toEqual({
      skill: 'perception',
      modifier: 7,
    })

    expect(creatureSavingThrowModifierEntrySchema.parse({ ability: 'wis', modifier: 5 })).toEqual({
      ability: 'wis',
      modifier: 5,
    })
  })
})

describe('character schema creature reuse', () => {
  it('keeps character ability scores and hit points shape stable', () => {
    const parsed = characterSchema.parse({
      id: 'char_1',
      name: 'Seren',
      rulesetId: 'srd-cc-5.2.1',
      characterType: 'pc',
      userId: 'user_1',
      classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }],
      species: { id: 'srd-cc-5.2.1:human' },
      alignment: 'ng',
      xp: 0,
      abilityScores: {
        str: 16,
        dex: 14,
        con: 15,
        int: 10,
        wis: 12,
        cha: 8,
      },
      hitPoints: { base: 12, current: 12, temporary: 0 },
      proficiencies: {},
      equipment: {},
      wealth: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(parsed.abilityScores).toEqual({
      str: 16,
      dex: 14,
      con: 15,
      int: 10,
      wis: 12,
      cha: 8,
    })
    expect(parsed.hitPoints).toEqual({ base: 12, current: 12, temporary: 0 })
  })
})
