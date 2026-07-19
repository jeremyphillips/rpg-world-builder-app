import { type CompactLabelAppearance, type CompactLabelTone } from './compact-label.lib'

export type BadgeAppearance = CompactLabelAppearance
export type BadgeTone = CompactLabelTone
export type BadgeSize = 'sm' | 'md' | 'lg'

export const badgeVariants = {
  defaultVariants: {
    appearance: 'soft' as const,
    tone: 'info' as const,
    size: 'md' as const,
  },
}
