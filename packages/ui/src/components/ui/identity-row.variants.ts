import { cva } from 'class-variance-authority'

import type { ContentCardDensity } from './content-card.variants'

export type IdentityRowDensity = ContentCardDensity

/** Identity copy stack — spacing from `identity-row.css`. */
export const IDENTITY_ROW_STACK_CLASS = 'ui-identity-row__stack' as const

export const identityRowRootVariants = cva('min-w-0 flex-1', {
  variants: {
    density: {
      compact: 'ui-identity-row--compact',
      comfortable: 'ui-identity-row--comfortable',
      spacious: 'ui-identity-row--spacious',
    },
  },
})

export const identityRowHeadingVariants = cva(
  'ui-identity-row__title ui-copy-title text-foreground',
)

export const identityRowClassificationVariants = cva('ui-identity-row__classification')

export const identityRowSupportingVariants = cva('ui-identity-row__supporting', {
  variants: {
    wrap: {
      true: 'ui-identity-row__supporting--wrap',
      false: 'ui-identity-row__supporting--truncate',
    },
  },
  defaultVariants: {
    wrap: false,
  },
})
