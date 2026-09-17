import { cva } from 'class-variance-authority'

import { createTabPanelContentOffsetClasses } from './create-tab-content.variants'

export const createModalShellBodyVariants = cva('gap-4')

/** Clip shell for scroll-mode content regions — inner DialogPanelScrollRegion owns overflow. */
export const createModalShellScrollShellClasses = 'flex min-h-0 flex-1 flex-col overflow-hidden'

export const createModalShellContentVariants = cva('min-h-0 flex-1', {
  variants: {
    mode: {
      managed: 'flex flex-col',
      scroll: createModalShellScrollShellClasses,
    },
  },
  defaultVariants: {
    mode: 'scroll',
  },
})

export const createModalShellTabsVariants = cva('flex min-h-0 flex-1 flex-col')

export const createModalShellTabsVisibilityVariants = cva('', {
  variants: { visible: { true: 'contents', false: 'hidden' } },
  defaultVariants: { visible: true },
})

export const createModalShellTabsListRegionVariants = cva('shrink-0 overflow-x-auto')

/** Focus ring + tab offset on scroll viewports inside CreateModalShell tab panels. */
export const createModalShellTabContentViewportClasses = `${createTabPanelContentOffsetClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

export const createModalShellTabContentVariants = cva(
  `${createTabPanelContentOffsetClasses} min-h-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden`,
  {
    variants: {
      mode: {
        managed: 'flex flex-col',
        scroll: createModalShellScrollShellClasses,
      },
    },
    defaultVariants: {
      mode: 'scroll',
    },
  },
)

export const createModalShellIssueSeparatorClasses = 'text-muted-foreground'
