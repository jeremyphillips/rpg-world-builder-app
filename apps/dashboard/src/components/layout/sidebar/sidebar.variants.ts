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

export const sidebarBrandClasses = 'flex h-16 shrink-0 items-center px-6'

/** Nav column below brand — fixed campaign chrome + scrollable primary sections. */
export const sidebarNavHostClasses = 'flex min-h-0 flex-1 flex-col overflow-hidden'

/** Campaign scope: exit link + switcher stay visible while sections scroll. */
export const sidebarNavChromeClasses = 'shrink-0 px-3'

export const sidebarNavScrollClasses =
  'scrollbar-slim flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4'

export const sidebarAsideVariants = cva(
  cn(
    'fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-sidebar shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar transition-transform md:static md:translate-x-0',
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
