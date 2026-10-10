import type { CompactLabelTone } from './compact-label.lib'

export const BADGE_APPEARANCES = ['strong', 'soft', 'outline'] as const

export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number]
export type BadgeTone = CompactLabelTone

export const BADGE_APPEARANCE_TONE_CLASSES = {
  outline: {
    neutral: 'ui-compact-label--outline-neutral',
    info: 'ui-compact-label--outline-info',
    success: 'ui-compact-label--outline-success',
    warning: 'ui-compact-label--outline-warning',
    destructive: 'ui-compact-label--outline-destructive',
  },
  soft: {
    neutral: 'ui-compact-label--soft-neutral',
    info: 'ui-compact-label--soft-info',
    success: 'ui-compact-label--soft-success',
    warning: 'ui-compact-label--soft-warning',
    destructive: 'ui-compact-label--soft-destructive',
  },
  strong: {
    neutral: 'ui-compact-label--strong-neutral',
    info: 'ui-compact-label--strong-info',
    success: 'ui-compact-label--strong-success',
    warning: 'ui-compact-label--strong-warning',
    destructive: 'ui-compact-label--strong-destructive',
  },
} as const satisfies Record<BadgeAppearance, Record<BadgeTone, string>>

export function badgeAppearanceToneClasses(appearance: BadgeAppearance, tone: BadgeTone): string {
  return BADGE_APPEARANCE_TONE_CLASSES[appearance][tone]
}
