import { describe, expect, it } from 'vitest'
import {
  ABILITIES,
  ABILITY_IDS,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  PC_ABILITY_SCORE_MAX,
  abilitySchema,
  abilityScoreSchema,
  pcAbilityScoreSchema,
} from './ability'

describe('abilitySchema', () => {
  it('accepts every known ability id', () => {
    for (const id of ABILITY_IDS) {
      expect(abilitySchema.parse(id)).toBe(id)
    }
  })

  it('derives ids from the ABILITIES map', () => {
    expect(ABILITY_IDS).toEqual(Object.keys(ABILITIES))
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

describe('pcAbilityScoreSchema', () => {
  it('caps at the PC maximum', () => {
    expect(pcAbilityScoreSchema.parse(PC_ABILITY_SCORE_MAX)).toBe(PC_ABILITY_SCORE_MAX)
    expect(pcAbilityScoreSchema.safeParse(PC_ABILITY_SCORE_MAX + 1).success).toBe(false)
  })
})
