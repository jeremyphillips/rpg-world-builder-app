import { cva } from 'class-variance-authority'

import type { ContentCardDensity } from './content-card.variants'

export type IdentityRowDensity = ContentCardDensity

export const identityRowRootVariants = cva('min-w-0 flex-1', {
  variants: {
    density: {
      compact: 'ui-identity-row--compact',
      comfortable: 'ui-identity-row--comfortable',
      spacious: 'ui-identity-row--spacious',
    },
  },
})

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
