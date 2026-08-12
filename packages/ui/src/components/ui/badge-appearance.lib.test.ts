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
    const classes = badgeAppearanceToneClasses('soft', 'destructive').split(/\s+/)
    expect(classes).toContain('text-semantic-destructive-soft-foreground')
    expect(classes).not.toContain('text-semantic-destructive')
  })

  it('uses token-owned outline foreground without dark-mode classes', () => {
    const classes = badgeAppearanceToneClasses('outline', 'info')
    expect(classes).toContain('text-semantic-info-outline-foreground')
    expect(classes).not.toMatch(/\bdark:/)
  })

  it('uses separate strong background and border roles', () => {
    const classes = badgeAppearanceToneClasses('strong', 'info').split(/\s+/)
    expect(classes).toContain('bg-semantic-info-strong')
    expect(classes).toContain('border-semantic-info-border')
  })
})
