import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const HEADING_STYLE_UTILITIES = [
  'heading-style-display',
  'heading-style-page',
  'heading-style-section',
  'heading-style-subsection',
  'heading-style-group',
  'heading-style-card',
  'heading-style-alert',
  'heading-style-nav',
  'heading-style-brand',
  'heading-style-label',
] as const

const EYEBROW_STYLE_UTILITIES = [
  'eyebrow-style-xs',
  'eyebrow-style-sm',
  'eyebrow-style-md',
] as const

const TYPOGRAPHY_CONFLICT_GROUPS = [
  'font-size',
  'font-weight',
  'tracking',
  'leading',
  'font-family',
  'text-color',
  'text-transform',
] as const

type TypographyClassGroupIds = 'heading-style' | 'eyebrow-style'

/**
 * Custom `text-*` font-size and `font-*` weight utilities from `@theme` in
 * `styles/globals.css`. Register here so `cn()` does not treat them as color
 * utilities and drop them.
 */
const twMerge = extendTailwindMerge<TypographyClassGroupIds>({
  extend: {
    theme: {
      text: [
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-display',
        'heading-page',
        'heading-section',
        'heading-subsection',
        'heading-group',
        'heading-card',
        'heading-compact',
        'heading-label',
        '2xs-meta',
        'xs-meta',
        'sm-meta',
        'md',
        'eyebrow-xs',
        'eyebrow-sm',
        'eyebrow-md',
        'badge-sm',
        'badge-md',
        'table-body',
        'table-stat',
        'field-group-legend',
        'field-subgroup-legend',
      ],
      'font-weight': [
        'heading-display',
        'heading',
        'heading-section',
        'heading-group',
        'heading-label',
        'body',
        'body-emphasis',
        'field-label',
        'meta',
        'data-name',
        'data-stat',
      ],
      tracking: ['heading', 'eyebrow-xs', 'eyebrow'],
    },
    classGroups: {
      'heading-style': [...HEADING_STYLE_UTILITIES],
      'eyebrow-style': [...EYEBROW_STYLE_UTILITIES],
    },
    conflictingClassGroups: {
      'heading-style': [...TYPOGRAPHY_CONFLICT_GROUPS],
      'eyebrow-style': [...TYPOGRAPHY_CONFLICT_GROUPS],
      'font-size': ['heading-style', 'eyebrow-style'],
      'font-weight': ['heading-style', 'eyebrow-style'],
      tracking: ['heading-style', 'eyebrow-style'],
      leading: ['heading-style'],
      'font-family': ['heading-style'],
      'text-color': ['eyebrow-style'],
      'text-transform': ['eyebrow-style'],
    },
  },
})

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * The single composition helper used by every component in this package.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
