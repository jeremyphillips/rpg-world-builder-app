import { describe, expect, it } from 'vitest'

import { getTermCompactLabel, vocabularyTermLabel } from '../types'
import { getAverageHitPointsLabel, HIT_POINTS_TERM } from './hit-points'

describe('HIT_POINTS_TERM', () => {
  it('uses lowercase sentence forms for generated prose', () => {
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'plural', casing: 'sentence' })).toBe(
      'hit points',
    )
    expect(vocabularyTermLabel(HIT_POINTS_TERM, { number: 'singular', casing: 'sentence' })).toBe(
      'hit point',
    )
  })

  it('exposes HP compact label and average authoring label', () => {
    expect(getTermCompactLabel(HIT_POINTS_TERM)).toBe('HP')
    expect(getAverageHitPointsLabel()).toBe('Average HP')
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
