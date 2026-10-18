import { cva } from 'class-variance-authority'

import {
  ROW_IDENTITY_STACK_GAP_CLASS,
  ROW_IDENTITY_STATUS_OFFSET_CLASS,
} from './row-anatomy/row-identity-rhythm.tokens'

/** Row identity text scale — not `FieldSizeToken` (field md is 15px `text-md`). */
export type IdentityRowSize = 'sm' | 'md' | 'lg'

export const identityRowRootVariants = cva('min-w-0 flex-1')

export const identityRowHeadingLineVariants = cva('flex w-full min-w-0 items-baseline')

/** Compact entity-card secondary copy on the title line. */
export const identityRowEntityCompactMetaVariants = cva('ui-identity-row__meta--entity-compact')

export const identityRowHeadingClusterVariants = cva('flex min-w-0 flex-1 items-baseline')

export const identityRowHeadingEndVariants = cva('shrink-0 text-style-caption')

export const identityRowHeadingVariants = cva(
  'ui-identity-row__title font-body-emphasis text-foreground',
  {
    variants: {
      size: {
        sm: 'ui-identity-row__title--sm',
        md: 'ui-identity-row__title--md',
        lg: 'ui-identity-row__title--lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const identityRowSeparatorVariants = cva('shrink-0 font-normal text-muted-foreground', {
  variants: {
    size: {
      sm: 'ui-identity-row__classification--sm',
      md: 'ui-identity-row__classification--md',
      lg: 'ui-identity-row__classification--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const identityRowClassificationVariants = cva(
  'ui-identity-row__classification shrink-0 font-normal text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'ui-identity-row__classification--sm',
        md: 'ui-identity-row__classification--md',
        lg: 'ui-identity-row__classification--lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const identityRowSupportingVariants = cva(
  'ui-identity-row__supporting text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'ui-identity-row__supporting--sm',
        md: 'ui-identity-row__supporting--md',
        lg: 'ui-identity-row__supporting--lg',
      },
      wrap: {
        true: 'ui-identity-row__supporting--wrap',
        false: 'ui-identity-row__supporting--truncate',
      },
    },
    defaultVariants: {
      size: 'md',
      wrap: false,
    },
  },
)

export const identityRowStackVariants = cva('flex flex-col', {
  variants: {
    size: {
      sm: ROW_IDENTITY_STACK_GAP_CLASS,
      md: ROW_IDENTITY_STACK_GAP_CLASS,
      lg: ROW_IDENTITY_STACK_GAP_CLASS,
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

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
