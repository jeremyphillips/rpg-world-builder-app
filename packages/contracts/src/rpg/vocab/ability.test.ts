import { describe, expect, it } from 'vitest'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  abilitySchema,
  abilityScoreSchema,
  buildGroupedSpellcastingAbilityOptions,
  characterAbilityScoreSchema,
  getAbilitySentenceForm,
} from './ability'
import { formatFieldMessage } from '../../validation/define-message'
import { abilityValidationMessages } from './ability-messages'

describe('abilitySchema', () => {
  it('accepts every known ability id', () => {
    for (const id of ABILITY_IDS) {
      expect(abilitySchema.parse(id)).toBe(id)
    }
  })

  it('derives ids from the ABILITY_ENTRIES map', () => {
    expect(ABILITY_IDS).toEqual(Object.keys(ABILITY_ENTRIES))
  })

  it('rejects full names and unknown values', () => {
    expect(abilitySchema.safeParse('Strength').success).toBe(false)
    expect(abilitySchema.safeParse('luck').success).toBe(false)
  })
})

describe('abilityScoreSchema', () => {
  it('accepts the full creature range', () => {
    expect(abilityScoreSchema.parse(ABILITY_SCORE_MIN)).toBe(ABILITY_SCORE_MIN)
    expect(abilityScoreSchema.parse(ABILITY_SCORE_MAX)).toBe(ABILITY_SCORE_MAX)
  })

  it('rejects out-of-range and non-integer values', () => {
    expect(abilityScoreSchema.safeParse(0).success).toBe(false)
    expect(abilityScoreSchema.safeParse(ABILITY_SCORE_MAX + 1).success).toBe(false)
    expect(abilityScoreSchema.safeParse(10.5).success).toBe(false)
  })
})

describe('characterAbilityScoreSchema', () => {
  it('caps at the character maximum', () => {
    expect(characterAbilityScoreSchema.parse(CHARACTER_ABILITY_SCORE_MAX)).toBe(
      CHARACTER_ABILITY_SCORE_MAX,
    )
    expect(characterAbilityScoreSchema.safeParse(CHARACTER_ABILITY_SCORE_MAX + 1).success).toBe(
      false,
    )
  })
})

describe('buildGroupedSpellcastingAbilityOptions', () => {
  it('groups standard and unusual spellcasting abilities', () => {
    expect(buildGroupedSpellcastingAbilityOptions()).toEqual([
      {
        label: 'Common',
        options: [
          { value: 'int', label: 'Intelligence' },
          { value: 'wis', label: 'Wisdom' },
          { value: 'cha', label: 'Charisma' },
        ],
      },
      {
        label: 'Advanced',
        options: [
          { value: 'str', label: 'Strength' },
          { value: 'dex', label: 'Dexterity' },
          { value: 'con', label: 'Constitution' },
        ],
      },
    ])
  })
})

describe('ability sentence forms', () => {
  it('returns lowercase ability phrases for generated prose', () => {
    expect(getAbilitySentenceForm('str', 1)).toBe('strength')
    expect(getAbilitySentenceForm('cha', 2)).toBe('charisma')
  })
})

describe('abilityValidationMessages', () => {
  it('formats the character score range message', () => {
    expect(
      formatFieldMessage(
        abilityValidationMessages.characterScoreOutOfRange({
          min: ABILITY_SCORE_MIN,
          max: CHARACTER_ABILITY_SCORE_MAX,
        }),
      ),
    ).toBe('Ability score must be between 1 and 20.')
  })
})
