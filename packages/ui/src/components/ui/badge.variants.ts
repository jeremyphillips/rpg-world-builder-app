import { cva } from 'class-variance-authority'

export type { BadgeAppearance, BadgeTone } from './badge-appearance.lib'
export { BADGE_APPEARANCES } from './badge-appearance.lib'

export type BadgeSize = 'sm' | 'md' | 'lg'

export type BadgeLayout = 'label' | 'counter'

export const badgeVariants = {
  defaultVariants: {
    appearance: 'soft' as const,
    tone: 'info' as const,
    size: 'md' as const,
    layout: 'label' as const,
  },
}

export const badgeLayoutVariants = cva('', {
  variants: {
    layout: {
      label: '',
      counter: 'ui-compact-label--counter',
    },
  },
  defaultVariants: {
    layout: 'label',
  },
})
