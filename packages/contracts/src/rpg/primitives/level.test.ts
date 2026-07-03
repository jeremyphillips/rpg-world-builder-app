import { describe, expect, it } from 'vitest'
import {
  absoluteLevelSchema,
  formatCharacterLevelLabel,
  formatLevelRangeLabel,
  levelSchema,
  MAX_CHARACTER_LEVEL,
} from './level'

describe('levelSchema', () => {
  it('accepts the full 1–20 range', () => {
    expect(levelSchema.parse(1)).toBe(1)
    expect(levelSchema.parse(MAX_CHARACTER_LEVEL)).toBe(MAX_CHARACTER_LEVEL)
  })

  it('rejects out-of-range and non-integer levels', () => {
    expect(levelSchema.safeParse(0).success).toBe(false)
    expect(levelSchema.safeParse(MAX_CHARACTER_LEVEL + 1).success).toBe(false)
    expect(levelSchema.safeParse(5.5).success).toBe(false)
  })
})

describe('absoluteLevelSchema', () => {
  it('accepts levels above the default ruleset cap', () => {
    expect(absoluteLevelSchema.parse(MAX_CHARACTER_LEVEL + 1)).toBe(21)
  })
})

describe('formatLevelRangeLabel', () => {
  it('uses singular Level N when min and max match', () => {
    expect(formatLevelRangeLabel({ minLevel: 1, maxLevel: 1 })).toBe('Level 1')
  })

  it('uses Levels N–M when min and max differ', () => {
    expect(formatLevelRangeLabel({ minLevel: 2, maxLevel: 4 })).toBe('Levels 2–4')
  })
})

describe('formatCharacterLevelLabel', () => {
  it('formats a single level', () => {
    expect(formatCharacterLevelLabel(1)).toBe('Level 1')
    expect(formatCharacterLevelLabel(12)).toBe('Level 12')
  })
})
