import { describe, expect, it } from 'vitest'

import { getTermSentenceForm } from './types'
import {
  CONTENT_VISIBILITY_MODE_ENTRIES,
  CONTENT_VISIBILITY_MODE_TERM,
  CONTENT_VISIBILITY_MODES,
  contentVisibilityModeSchema,
} from './content-visibility'

describe('contentVisibilityModeSchema', () => {
  it('matches CONTENT_VISIBILITY_MODES', () => {
    expect(contentVisibilityModeSchema.options).toEqual([...CONTENT_VISIBILITY_MODES])
  })
})

describe('content visibility vocabulary', () => {
  it('defines the player access vocabulary term', () => {
    expect(CONTENT_VISIBILITY_MODE_TERM.label).toBe('Player access')
    expect(getTermSentenceForm(CONTENT_VISIBILITY_MODE_TERM, 1)).toBe('player access')
    expect(getTermSentenceForm(CONTENT_VISIBILITY_MODE_TERM, 2)).toBe('player access settings')
  })

  it('has a label and description for every visibility mode', () => {
    for (const mode of CONTENT_VISIBILITY_MODES) {
      const entry = CONTENT_VISIBILITY_MODE_ENTRIES[mode]
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.description).toContain('while it is available')
    }
  })
})
