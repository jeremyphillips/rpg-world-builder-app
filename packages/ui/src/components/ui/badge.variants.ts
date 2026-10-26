import { cva } from 'class-variance-authority'

export type { BadgeAppearance, BadgeTone } from './badge-appearance.lib'
export { BADGE_APPEARANCES, BADGE_TONES } from './badge-appearance.lib'

export type BadgeSize = 'sm' | 'md' | 'lg'

export const UI_BADGE_SIZE_CLASSES = ['ui-badge--sm', 'ui-badge--md', 'ui-badge--lg'] as const

export const badgeSizeVariants = cva('', {
  variants: {
    size: {
      sm: 'ui-badge--sm',
      md: 'ui-badge--md',
      lg: 'ui-badge--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type BadgeLayout = 'label' | 'counter'

export const badgeLayoutVariants = cva('', {
  variants: {
    layout: {
      label: '',
      counter: 'ui-badge--counter',
    },
  },
  defaultVariants: {
    layout: 'label',
  },
})

export const BADGE_EMPHASES = ['default', 'subdued'] as const

export type BadgeEmphasis = (typeof BADGE_EMPHASES)[number]

/** Visual weight, orthogonal to tone. Subdued is muted copy, not a disabled control. */
export function badgeEmphasisClass(emphasis: BadgeEmphasis = 'default'): string | null {
  return emphasis === 'subdued' ? 'ui-badge--subdued' : null
}
