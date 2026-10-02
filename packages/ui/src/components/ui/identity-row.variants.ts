import { cva, type VariantProps } from 'class-variance-authority'

/** Row identity text scale — not `FieldSizeToken` (field md is 15px `text-md`). */
export type IdentityRowSize = 'sm' | 'md' | 'lg'

export const identityRowRootVariants = cva('min-w-0 flex-1')

export const identityRowHeadingLineVariants = cva('flex min-w-0 items-baseline')

export const identityRowHeadingClusterVariants = cva('flex min-w-0 flex-1 items-baseline')

export const identityRowHeadingEndVariants = cva('shrink-0 text-xs text-muted-foreground')

export const identityRowHeadingVariants = cva(
  'min-w-0 shrink truncate font-body-emphasis text-foreground [&_a]:truncate',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
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
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const identityRowClassificationVariants = cva('shrink-0 font-normal text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const identityRowSupportingVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
    wrap: {
      true: 'leading-snug',
      false: 'truncate',
    },
  },
  defaultVariants: {
    size: 'md',
    wrap: false,
  },
})

export const identityRowStatusVariants = cva('mt-1')

export const identityRowStackVariants = cva('flex min-w-0 flex-col', {
  variants: {
    size: {
      sm: 'gap-0.5',
      md: 'gap-0.5',
      lg: 'gap-1',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type IdentityRowVariantProps = VariantProps<typeof identityRowHeadingVariants>
