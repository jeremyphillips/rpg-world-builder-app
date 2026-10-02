import { describe, expect, it } from 'vitest'

import { vocabularyTermLabel } from '../types'
import { HIT_POINTS_TERM } from './hit-points'

describe('HIT_POINTS_TERM', () => {
  it('uses lowercase sentence forms for generated prose', () => {
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'plural', casing: 'sentence' })).toBe(
      'hit points',
    )
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'singular', casing: 'sentence' })).toBe(
      'hit point',
    )
  })

  it('keeps title label on the term for editorial surfaces', () => {
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'singular', casing: 'title' })).toBe(
      'Hit Points',
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
