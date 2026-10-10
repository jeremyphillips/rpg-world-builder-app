import { describe, expect, it } from 'vitest'

import {
  BADGE_APPEARANCE_TONE_CLASSES,
  BADGE_APPEARANCES,
  badgeAppearanceToneClasses,
} from './badge-appearance.lib'
import { COMPACT_LABEL_TONES } from './compact-label.lib'

describe('badgeAppearanceToneClasses', () => {
  it('covers every tone × appearance combination', () => {
    for (const appearance of BADGE_APPEARANCES) {
      for (const tone of COMPACT_LABEL_TONES) {
        expect(BADGE_APPEARANCE_TONE_CLASSES[appearance][tone]).toBe(
          badgeAppearanceToneClasses(appearance, tone),
        )
      }
    }
  })

  it('uses token-owned soft destructive foreground', () => {
    expect(badgeAppearanceToneClasses('soft', 'destructive')).toBe(
      'ui-compact-label--soft-destructive',
    )
  })

  it('uses token-owned outline foreground without dark-mode classes', () => {
    const classes = badgeAppearanceToneClasses('outline', 'info')
    expect(classes).toBe('ui-compact-label--outline-info')
    expect(classes).not.toMatch(/\bdark:/)
  })

  it('uses separate strong background and border roles', () => {
    expect(badgeAppearanceToneClasses('strong', 'info')).toBe('ui-compact-label--strong-info')
  })
})
