import { describe, expect, it } from 'vitest'

import {
  assertSelectCompactSizing,
  isSelectCompactTrigger,
  resolveSelectSizingGhostLabels,
} from './select-trigger.lib'

describe('assertSelectCompactSizing', () => {
  it('allows digits alone', () => {
    expect(() => assertSelectCompactSizing({ digits: 2 })).not.toThrow()
  })

  it('allows sizingLabel alone', () => {
    expect(() => assertSelectCompactSizing({ sizingLabel: 'GP' })).not.toThrow()
  })

  it('allows sizingLabels alone', () => {
    expect(() => assertSelectCompactSizing({ sizingLabels: ['GP', 'SP'] })).not.toThrow()
  })

  it('rejects digits and sizingLabel together', () => {
    expect(() => assertSelectCompactSizing({ digits: 2, sizingLabel: 'GP' })).toThrow(
      'SelectTrigger: `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive.',
    )
  })

  it('rejects digits and sizingLabels together', () => {
    expect(() => assertSelectCompactSizing({ digits: 2, sizingLabels: ['GP'] })).toThrow(
      'SelectTrigger: `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive.',
    )
  })

  it('rejects sizingLabel and sizingLabels together', () => {
    expect(() => assertSelectCompactSizing({ sizingLabel: 'GP', sizingLabels: ['SP'] })).toThrow(
      'SelectTrigger: `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive.',
    )
  })
})

describe('isSelectCompactTrigger', () => {
  it('returns true for digits', () => {
    expect(isSelectCompactTrigger({ digits: 2 })).toBe(true)
  })

  it('returns true for non-empty sizingLabel', () => {
    expect(isSelectCompactTrigger({ sizingLabel: 'GP' })).toBe(true)
  })

  it('returns true for non-empty sizingLabels', () => {
    expect(isSelectCompactTrigger({ sizingLabels: ['GP'] })).toBe(true)
  })

  it('returns false for prose triggers', () => {
    expect(isSelectCompactTrigger({})).toBe(false)
  })
})

describe('resolveSelectSizingGhostLabels', () => {
  it('returns all sizingLabels when provided', () => {
    expect(resolveSelectSizingGhostLabels({ sizingLabels: ['GP', 'SP'] })).toEqual(['GP', 'SP'])
  })

  it('returns a single sizingLabel when provided', () => {
    expect(resolveSelectSizingGhostLabels({ sizingLabel: 'GP' })).toEqual(['GP'])
  })

  it('returns empty array when no text sizing is configured', () => {
    expect(resolveSelectSizingGhostLabels({})).toEqual([])
  })
})
