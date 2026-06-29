import { describe, expect, it } from 'vitest'

import { badgeTextColorForBackground, epicBadgeBackgroundColor } from './epic-badge.lib'

describe('badgeTextColorForBackground', () => {
  it('returns dark text on light backgrounds', () => {
    expect(badgeTextColorForBackground('#ffffff')).toBe('#000000')
  })

  it('returns light text on dark backgrounds', () => {
    expect(badgeTextColorForBackground('#111827')).toBe('#ffffff')
  })
})

describe('epicBadgeBackgroundColor', () => {
  it('falls back to the default epic badge color', () => {
    expect(epicBadgeBackgroundColor(undefined)).toBe('#6366f1')
  })
})
