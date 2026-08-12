export type { BadgeAppearance, BadgeTone } from './badge-appearance.lib'
export { BADGE_APPEARANCES } from './badge-appearance.lib'

export type BadgeSize = 'sm' | 'md' | 'lg'

export const badgeVariants = {
  defaultVariants: {
    appearance: 'soft' as const,
    tone: 'info' as const,
    size: 'md' as const,
  },
}
