import { cva } from 'class-variance-authority'

/** Entity-owned density inset for embedded hosts — standalone shells use EntityCardFrame instead. */
export const entityItemRootVariants = cva('w-full min-w-0', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-5 py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const entityItemAnatomyVariants = cva('flex min-w-0 w-full', {
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

export const entityItemLeadingVariants = cva('shrink-0')

export const entityItemActionVariants = cva('shrink-0 self-center')

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
