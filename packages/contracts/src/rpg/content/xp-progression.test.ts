import { describe, expect, it } from 'vitest'

import {
  xpProgressionBodySchema,
  xpProgressionScopeSchema,
  xpRequiredForLevel,
} from './xp-progression'

const BASE_PROGRESSION = {
  name: 'Standard XP Progression',
  scope: { kind: 'standard' },
  entries: [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 300 },
    { level: 3, xpRequired: 900 },
  ],
}

describe('xpProgressionScopeSchema', () => {
  it('accepts standard and class-specific scopes', () => {
    expect(xpProgressionScopeSchema.parse({ kind: 'standard' })).toEqual({ kind: 'standard' })
    expect(
      xpProgressionScopeSchema.parse({ kind: 'class', classId: 'srd-cc-5.2.1:fighter' }),
    ).toEqual({
      kind: 'class',
      classId: 'srd-cc-5.2.1:fighter',
    })
  })

  it('requires a class id for class-specific progressions', () => {
    expect(xpProgressionScopeSchema.safeParse({ kind: 'class' }).success).toBe(false)
  })
})

describe('xpProgressionBodySchema', () => {
  it('accepts contiguous level thresholds starting at 0 XP', () => {
    expect(xpProgressionBodySchema.parse(BASE_PROGRESSION)).toEqual(BASE_PROGRESSION)
  })

  it('rejects tables that do not start at level 1 with 0 XP', () => {
    expect(
      xpProgressionBodySchema.safeParse({
        ...BASE_PROGRESSION,
        entries: [
          { level: 1, xpRequired: 1 },
          { level: 2, xpRequired: 300 },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects skipped levels', () => {
    expect(
      xpProgressionBodySchema.safeParse({
        ...BASE_PROGRESSION,
        entries: [
          { level: 1, xpRequired: 0 },
          { level: 3, xpRequired: 900 },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects non-increasing XP thresholds', () => {
    expect(
      xpProgressionBodySchema.safeParse({
        ...BASE_PROGRESSION,
        entries: [
          { level: 1, xpRequired: 0 },
          { level: 2, xpRequired: 300 },
          { level: 3, xpRequired: 300 },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('xpRequiredForLevel', () => {
  it('returns the threshold for a matching level', () => {
    expect(xpRequiredForLevel(BASE_PROGRESSION, 3)).toBe(900)
  })

  it('returns undefined when the table does not include the requested level', () => {
    expect(xpRequiredForLevel(BASE_PROGRESSION, 4)).toBeUndefined()
  })
})
