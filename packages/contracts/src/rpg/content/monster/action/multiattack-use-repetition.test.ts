import { describe, expect, it } from 'vitest'

import {
  multiattackUseClauseHasRepetition,
  multiattackUseClauseRepetitionEligible,
  multiattackUseClauseRepetitionInvalid,
  multiattackUseClauseRepetitionRepairRequired,
} from './multiattack-use-repetition'

describe('multiattackUseClauseRepetitionEligible', () => {
  it('allows repetition for non-spell actions', () => {
    expect(multiattackUseClauseRepetitionEligible('save')).toBe(true)
    expect(multiattackUseClauseRepetitionEligible(undefined)).toBe(true)
  })

  it('disallows repetition for spellcasting', () => {
    expect(multiattackUseClauseRepetitionEligible('spell')).toBe(false)
  })
})

describe('multiattackUseClauseRepetitionRepairRequired', () => {
  it('requires repair for invalid stored spell repetition only', () => {
    expect(multiattackUseClauseRepetitionRepairRequired('spell', 2)).toBe(true)
    expect(multiattackUseClauseRepetitionRepairRequired('spell', '3')).toBe(true)
    expect(multiattackUseClauseRepetitionRepairRequired('spell', undefined)).toBe(false)
    expect(multiattackUseClauseRepetitionRepairRequired('spell', 1)).toBe(false)
    expect(multiattackUseClauseRepetitionRepairRequired('save', 2)).toBe(false)
  })
})

describe('multiattackUseClauseRepetitionInvalid', () => {
  it('flags publish-invalid spell counts above one', () => {
    expect(multiattackUseClauseRepetitionInvalid('spell', 2)).toBe(true)
    expect(multiattackUseClauseRepetitionInvalid('spell', 1)).toBe(false)
    expect(multiattackUseClauseRepetitionInvalid('save', 2)).toBe(false)
  })
})

describe('multiattackUseClauseHasRepetition', () => {
  it('tracks disclosure-open repetition values', () => {
    expect(multiattackUseClauseHasRepetition(2)).toBe(true)
    expect(multiattackUseClauseHasRepetition('0')).toBe(true)
    expect(multiattackUseClauseHasRepetition(1)).toBe(false)
  })
})
