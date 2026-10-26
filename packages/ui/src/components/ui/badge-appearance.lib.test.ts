import { describe, expect, it } from 'vitest'

import {
  BADGE_APPEARANCE_TONE_CLASSES,
  BADGE_APPEARANCES,
  BADGE_TONES,
  badgeAppearanceToneClasses,
  badgeSurfaceClasses,
} from './badge-appearance.lib'

describe('badgeAppearanceToneClasses', () => {
  it('covers every tone × appearance combination', () => {
    for (const appearance of BADGE_APPEARANCES) {
      for (const tone of BADGE_TONES) {
        expect(BADGE_APPEARANCE_TONE_CLASSES[appearance][tone]).toBe(
          badgeAppearanceToneClasses(appearance, tone),
        )
      }
    }
  })

  it('uses token-owned soft destructive foreground', () => {
    expect(badgeAppearanceToneClasses('soft', 'destructive')).toBe('ui-badge--soft-destructive')
  })

  it('uses token-owned outline foreground without dark-mode classes', () => {
    const classes = badgeAppearanceToneClasses('outline', 'info')
    expect(classes).toBe('ui-badge--outline-info')
    expect(classes).not.toMatch(/\bdark:/)
  })

  it('uses separate strong background and border roles', () => {
    expect(badgeAppearanceToneClasses('strong', 'info')).toBe('ui-badge--strong-info')
  })

  it('adds the surface-relative border only for neutral tones', () => {
    expect(badgeSurfaceClasses('soft', 'neutral')).toBe('ui-badge--soft-neutral ui-border--default')
    expect(badgeSurfaceClasses('soft', 'info')).toBe('ui-badge--soft-info')
  })
})
