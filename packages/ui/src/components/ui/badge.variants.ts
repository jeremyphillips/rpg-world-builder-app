import { type CompactLabelAppearance, type CompactLabelTone } from './compact-label.lib'

export type BadgeAppearance = CompactLabelAppearance
export type BadgeTone = CompactLabelTone
export type BadgeSize = 'sm' | 'md' | 'lg'

export const badgeVariants = {
  defaultVariants: {
    appearance: 'soft' as const,
    tone: 'informative' as const,
    size: 'md' as const,
  },
}

export type LegacyBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

/** @deprecated Used by TableBadgeCell legacy prop until consumer migrations land. */
export function mapLegacyBadgeVariant(variant: LegacyBadgeVariant): {
  appearance: BadgeAppearance
  tone: BadgeTone
} {
  switch (variant) {
    case 'default':
      return { appearance: 'soft', tone: 'informative' }
    case 'secondary':
      return { appearance: 'neutral', tone: 'neutral' }
    case 'destructive':
      return { appearance: 'soft', tone: 'negative' }
    case 'outline':
      return { appearance: 'outline', tone: 'neutral' }
  }
}

export { dismissibleBadgeVariants, badgeDismissButtonVariants } from './badge-dismiss.variants'
