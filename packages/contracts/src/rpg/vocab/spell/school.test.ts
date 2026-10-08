import { describe, expect, it } from 'vitest'

import { getTermCompactLabel, getTermSentenceForm } from '../types'
import {
  SPELL_SCHOOL_SET_ID,
  SPELL_SCHOOL_TERM,
  getSpellSchoolLabel,
  spellSchoolIdSchema,
} from './school'

describe('spellSchoolIdSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    expect(spellSchoolIdSchema.parse('evocation')).toBe('evocation')
    expect(spellSchoolIdSchema.parse('custom-school')).toBe('custom-school')
  })

  it('rejects invalid slug shapes', () => {
    expect(spellSchoolIdSchema.safeParse('Evocation').success).toBe(false)
    expect(spellSchoolIdSchema.safeParse('evocation').success).toBe(true)
  })
})

describe('spell school vocabulary', () => {
  it('registers the spell school option set id', () => {
    expect(SPELL_SCHOOL_SET_ID).toBe('spell-schools')
  })

  it('keeps the compact chip label separate from the taxonomy name', () => {
    expect(SPELL_SCHOOL_TERM.label).toBe('School of Magic')
    expect(getTermCompactLabel(SPELL_SCHOOL_TERM)).toBe('School')
    expect(getTermSentenceForm(SPELL_SCHOOL_TERM, 1)).toBe('school of magic')
  })

  it('returns title-cased slug labels', () => {
    expect(getSpellSchoolLabel('abjuration')).toBe('Abjuration')
    expect(getSpellSchoolLabel('custom-school')).toBe('Custom School')
  })
})
