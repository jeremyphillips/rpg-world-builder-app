import { describe, expect, it } from 'vitest'

import {
  getNarrativePreviewStatus,
  getNarrativePreviewStatusLabel,
  narrativeFieldCount,
} from './narrative-preview'

describe('narrative preview helpers', () => {
  it('counts filled narrative slots', () => {
    expect(narrativeFieldCount(undefined)).toBe(0)
    expect(
      narrativeFieldCount({
        ideals: ['Honor'],
        bonds: ['My clan'],
      }),
    ).toBe(2)
  })

  it('returns preview status labels', () => {
    expect(getNarrativePreviewStatusLabel(0)).toBe('Nothing added yet.')
    expect(getNarrativePreviewStatusLabel(1)).toBe('1 field added.')
    expect(getNarrativePreviewStatusLabel(3)).toBe('3 fields added.')
  })

  it('marks narrative complete when all slots are filled', () => {
    expect(
      getNarrativePreviewStatus({
        personalityTraits: ['Brave'],
        ideals: ['Justice'],
        bonds: ['Family'],
        flaws: ['Pride'],
        backstory: '<p>Origin story.</p>',
      }),
    ).toBe('complete')
  })
})
