import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const sidebarOverlayVariants = cva(
  'fixed inset-0 z-40 bg-overlay transition-opacity md:hidden',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: {
      open: false,
    },
  },
)

export const sidebarAsideVariants = cva(
  cn(
    'fixed inset-y-0 left-0 z-50 flex w-sidebar shrink-0 flex-col border-r border-border bg-sidebar transition-transform md:static md:translate-x-0',
    establishSurfaceCurrent('sidebar'),
  ),
  {
    variants: {
      open: {
        true: 'translate-x-0',
        false: '-translate-x-full',
      },
    },
    defaultVariants: {
      open: false,
    },
  },
)
