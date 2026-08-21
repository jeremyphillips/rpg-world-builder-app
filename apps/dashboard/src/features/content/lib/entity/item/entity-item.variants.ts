import { cva } from 'class-variance-authority'

/** Embedded EntityItem host — anatomy only; collection inset owned by the host. */
export const entityItemRootVariants = cva('w-full min-w-0')

/** Grid cross-axis — top-aligned so rails pin to the heading band, not full summary height. */
export const entityItemAnatomyVariants = cva(
  'grid min-w-0 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start',
  {
    variants: {
      density: {
        compact: 'gap-y-1',
        comfortable: 'gap-y-1',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

/** Leading rail track — contentGap lives on EntityLeadingRail padding-inline-end. */
export const entityItemLeadingSlotVariants = cva('col-start-1 row-start-1 min-w-0')

/** Content track — always column 2 so summary owns the flexible column. */
export const entityItemContentVariants = cva('col-start-2 row-start-1 flex min-w-0 items-start', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Trailing rail track — only rendered when `trailing` is set. */
export const entityItemTrailingSlotVariants = cva(
  'col-start-3 row-start-1 min-w-0 justify-self-end',
  {
    variants: {
      density: {
        compact: 'ml-2',
        comfortable: 'ml-3',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)
