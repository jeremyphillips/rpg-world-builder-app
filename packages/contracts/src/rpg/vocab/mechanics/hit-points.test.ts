import { describe, expect, it } from 'vitest'

import { vocabularyTermLabel } from '../types'
import { HIT_POINTS_TERM } from './hit-points'

describe('HIT_POINTS_TERM', () => {
  it('uses title-case Hit Points in authoring prose', () => {
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'plural', casing: 'sentence' })).toBe(
      'Hit Points',
    )
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'singular', casing: 'sentence' })).toBe(
      'Hit Point',
    )
  })

  it('lowercases for resolution-preview register at the call site', () => {
    const phrase = vocabularyTermLabel(HIT_POINTS_TERM, {
      number: 'plural',
      casing: 'sentence',
    }).toLowerCase()
    expect(phrase).toBe('hit points')
  })
})
