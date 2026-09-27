import { cva, type VariantProps } from 'class-variance-authority'

export const contentStatRowVariants = cva('font-body-emphasis', {
  variants: {
    size: {
      default: 'text-md',
      sm: 'text-sm',
    },
    layout: {
      inline: '',
      hero: '',
    },
  },
  defaultVariants: {
    size: 'default',
    layout: 'inline',
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
      layout: {
        inline: '',
        hero: 'text-foreground',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'inline',
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
      layout: {
        inline: '',
        hero: 'min-w-0 text-left',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'inline',
    },
  },
)

/** Single grid so value cells share one alignment column across rows. */
export const contentDetailStatRowsGridClasses =
  'grid h-fit auto-rows-auto grid-cols-[auto_minmax(0,1fr)] content-start items-baseline gap-x-8 gap-y-1.5 self-start'

export const contentDetailStatRowsColumnClasses = 'h-fit min-w-0 self-start'

export const contentDetailStatRowsSplitClasses =
  'grid items-start gap-x-6 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]'

export const contentDetailStatRowsSplitDividerClasses =
  'hidden w-px self-stretch border-l border-border-subtle md:block'

export type ContentStatRowSize = NonNullable<VariantProps<typeof contentStatRowVariants>['size']>
export type ContentStatRowLayout = NonNullable<
  VariantProps<typeof contentStatRowVariants>['layout']
>
