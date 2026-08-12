import type { CompactLabelTone } from './compact-label.lib'

export const BADGE_APPEARANCES = ['strong', 'soft', 'outline'] as const

export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number]
export type BadgeTone = CompactLabelTone

export const BADGE_APPEARANCE_TONE_CLASSES = {
  outline: {
    neutral:
      'border border-semantic-neutral-border bg-transparent text-semantic-neutral-outline-foreground font-medium',
    info: 'border border-semantic-info-border bg-transparent text-semantic-info-outline-foreground font-medium',
    success:
      'border border-semantic-success-border bg-transparent text-semantic-success-outline-foreground font-medium',
    warning:
      'border border-semantic-warning-border bg-transparent text-semantic-warning-outline-foreground font-medium',
    destructive:
      'border border-semantic-destructive-border bg-transparent text-semantic-destructive-outline-foreground font-medium',
  },
  soft: {
    neutral:
      'border border-semantic-neutral-border bg-semantic-neutral-soft text-semantic-neutral-soft-foreground font-medium',
    info: 'border border-semantic-info-border bg-semantic-info-soft text-semantic-info-soft-foreground font-medium',
    success:
      'border border-semantic-success-border bg-semantic-success-soft text-semantic-success-soft-foreground font-medium',
    warning:
      'border border-semantic-warning-border bg-semantic-warning-soft text-semantic-warning-soft-foreground font-medium',
    destructive:
      'border border-semantic-destructive-border bg-semantic-destructive-soft text-semantic-destructive-soft-foreground font-medium',
  },
  strong: {
    neutral:
      'border border-semantic-neutral-border bg-semantic-neutral-strong text-semantic-neutral-strong-foreground font-medium',
    info: 'border border-semantic-info-border bg-semantic-info-strong text-semantic-info-strong-foreground font-medium',
    success:
      'border border-semantic-success-border bg-semantic-success-strong text-semantic-success-strong-foreground font-medium',
    warning:
      'border border-semantic-warning-border bg-semantic-warning-strong text-semantic-warning-strong-foreground font-medium',
    destructive:
      'border border-semantic-destructive-border bg-semantic-destructive-strong text-semantic-destructive-strong-foreground font-medium',
  },
} as const satisfies Record<BadgeAppearance, Record<BadgeTone, string>>

export function badgeAppearanceToneClasses(appearance: BadgeAppearance, tone: BadgeTone): string {
  return BADGE_APPEARANCE_TONE_CLASSES[appearance][tone]
}
