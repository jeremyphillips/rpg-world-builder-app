import { cva } from 'class-variance-authority'

export type { BadgeAppearance, BadgeTone } from './badge-appearance.lib'
export { BADGE_APPEARANCES } from './badge-appearance.lib'

export type BadgeSize = 'sm' | 'md' | 'lg'

export type BadgeLayout = 'label' | 'counter'

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
