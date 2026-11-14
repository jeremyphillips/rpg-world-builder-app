import { describe, expect, it } from 'vitest'

import {
  ALL_OMITTED_SPELL_COMPONENTS,
  formatMonsterSpellComponentOmissionClause,
  normalizeOmittedSpellComponents,
  omittedSpellComponentsEqual,
} from './spell-component-omission'

describe('normalizeOmittedSpellComponents', () => {
  it('normalizes component identities and ignores order', () => {
    expect(normalizeOmittedSpellComponents(['material', 'verbal'])).toEqual(['verbal', 'material'])
    expect(omittedSpellComponentsEqual(['somatic', 'material'], ['material', 'somatic'])).toBe(true)
  })
})

describe('formatMonsterSpellComponentOmissionClause', () => {
  it('returns empty prose when omissions are absent', () => {
    expect(formatMonsterSpellComponentOmissionClause(undefined)).toBe('')
  })

  it('prints material-only and all-component clauses', () => {
    expect(formatMonsterSpellComponentOmissionClause(['material'])).toBe(
      'requiring no Material components',
    )
    expect(formatMonsterSpellComponentOmissionClause(ALL_OMITTED_SPELL_COMPONENTS)).toBe(
      'requiring no spell components',
    )
  })

  it('prints custom omission combinations', () => {
    expect(formatMonsterSpellComponentOmissionClause(['verbal'])).toBe(
      'requiring no Verbal components',
    )
    expect(formatMonsterSpellComponentOmissionClause(['somatic', 'material'])).toBe(
      'requiring no Somatic or Material components',
    )
  })
})
