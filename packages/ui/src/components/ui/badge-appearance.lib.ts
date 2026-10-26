export const BADGE_APPEARANCES = ['strong', 'soft', 'outline'] as const

export const BADGE_TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number]
export type BadgeTone = (typeof BADGE_TONES)[number]

export const BADGE_APPEARANCE_TONE_CLASSES = {
  outline: {
    neutral: 'ui-badge--outline-neutral',
    info: 'ui-badge--outline-info',
    success: 'ui-badge--outline-success',
    warning: 'ui-badge--outline-warning',
    destructive: 'ui-badge--outline-destructive',
  },
  soft: {
    neutral: 'ui-badge--soft-neutral',
    info: 'ui-badge--soft-info',
    success: 'ui-badge--soft-success',
    warning: 'ui-badge--soft-warning',
    destructive: 'ui-badge--soft-destructive',
  },
  strong: {
    neutral: 'ui-badge--strong-neutral',
    info: 'ui-badge--strong-info',
    success: 'ui-badge--strong-success',
    warning: 'ui-badge--strong-warning',
    destructive: 'ui-badge--strong-destructive',
  },
} as const satisfies Record<BadgeAppearance, Record<BadgeTone, string>>

export function badgeAppearanceToneClasses(appearance: BadgeAppearance, tone: BadgeTone): string {
  return BADGE_APPEARANCE_TONE_CLASSES[appearance][tone]
}

/** Neutral borders use the surface-relative mix from `ui-border--default`. */
export function badgeSurfaceClasses(appearance: BadgeAppearance, tone: BadgeTone): string {
  const appearanceClass = badgeAppearanceToneClasses(appearance, tone)
  return tone === 'neutral' ? `${appearanceClass} ui-border--default` : appearanceClass
}

/** twMerge group — badge appearance × tone modifiers. */
export const UI_BADGE_APPEARANCE_CLASSES = Object.values(BADGE_APPEARANCE_TONE_CLASSES).flatMap(
  (byTone) => Object.values(byTone),
) as readonly string[]
