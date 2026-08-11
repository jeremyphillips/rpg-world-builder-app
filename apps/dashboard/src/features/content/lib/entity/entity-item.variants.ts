import { cva } from 'class-variance-authority'

/** Embedded EntityItem host — anatomy only; collection inset owned by the host. */
export const entityItemRootVariants = cva('w-full min-w-0')

export const entityItemAnatomyVariants = cva(
  'grid min-w-0 w-full grid-cols-[auto_minmax(0,1fr)_auto]',
  {
    variants: {
      density: {
        compact: 'gap-x-2 gap-y-1',
        comfortable: 'gap-x-3 gap-y-1',
      },
      rowAlign: {
        start: 'items-start',
        center: 'items-center',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      rowAlign: 'start',
    },
  },
)

export const entityItemContentVariants = cva('flex min-w-0', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
    },
    rowAlign: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    rowAlign: 'start',
  },
})

export const entitySummaryDescriptionVariants = cva('truncate text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const entitySummaryStatusVariants = cva('truncate text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const entityItemStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')
