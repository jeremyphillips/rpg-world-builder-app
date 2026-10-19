import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  ROW_IDENTITY_STACK_GAP_CLASS,
  ROW_IDENTITY_STATUS_OFFSET_CLASS,
} from './row-anatomy/row-identity-rhythm.tokens'

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

export const identityRowHeadingLineVariants = cva('flex w-full min-w-0 items-baseline')

/** Compact entity-card secondary copy on the title line. */
export const identityRowEntityCompactMetaVariants = cva('ui-identity-row__meta--entity-compact')

export const identityRowHeadingClusterVariants = cva('flex min-w-0 flex-1 items-baseline')

export const identityRowHeadingEndVariants = cva('shrink-0 text-style-caption')

export const identityRowHeadingVariants = cva(
  'ui-identity-row__title font-body-emphasis text-foreground',
)

export const identityRowSeparatorVariants = cva(
  'ui-identity-row__classification shrink-0 font-normal text-muted-foreground',
)

export const identityRowClassificationVariants = cva(
  'ui-identity-row__classification shrink-0 font-normal text-muted-foreground',
)

export const identityRowSupportingVariants = cva(
  'ui-identity-row__supporting text-muted-foreground',
  {
    variants: {
      wrap: {
        true: 'ui-identity-row__supporting--wrap',
        false: 'ui-identity-row__supporting--truncate',
      },
    },
    defaultVariants: {
      wrap: false,
    },
  },
)

export const identityRowStackVariants = cva(cn('flex flex-col', ROW_IDENTITY_STACK_GAP_CLASS))

export const identityRowStatusVariants = cva('', {
  variants: {
    spacing: {
      offset: ROW_IDENTITY_STATUS_OFFSET_CLASS,
      flush: '',
    },
  },
  defaultVariants: {
    spacing: 'offset',
  },
})
