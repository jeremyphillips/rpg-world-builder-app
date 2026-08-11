import { cva, type VariantProps } from 'class-variance-authority'

export const contentStatRowVariants = cva('font-body-emphasis', {
  variants: {
    size: {
      default: 'text-md',
      sm: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const contentStatRowLabelVariants = cva(
  'inline-flex items-center gap-1 font-body-emphasis',
  {
    variants: {
      size: {
        default: 'text-md',
        sm: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export const contentStatRowValueVariants = cva(
  'inline-flex items-center gap-1 text-muted-foreground',
  {
    variants: {
      size: {
        default: 'text-md',
        sm: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type ContentStatRowSize = NonNullable<VariantProps<typeof contentStatRowVariants>['size']>
