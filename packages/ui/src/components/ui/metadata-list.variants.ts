import { cva, type VariantProps } from 'class-variance-authority'

/** Label left, values sharing one start edge after a column gap. No colon. */
export const metadataListVariants = cva(
  'grid w-full grid-cols-[max-content_minmax(0,max-content)] items-baseline gap-x-6 gap-y-1.5 border-b border-border-subtle pb-4 font-body-emphasis',
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

export const metadataListLabelVariants = cva('inline-flex items-center gap-1 text-foreground')

export const metadataListValueVariants = cva(
  'inline-flex min-w-0 items-center justify-start gap-1 text-left text-muted-foreground',
)

export type MetadataListSize = NonNullable<VariantProps<typeof metadataListVariants>['size']>
