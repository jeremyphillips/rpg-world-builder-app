import { cva } from 'class-variance-authority'

import type { GlobalSearchSurfaceContext } from './global-search-surface.variants'
import { resolveGlobalSearchHeadingSurfaceClasses } from './global-search-surface.variants'

/** Horizontal inset co-located with chrome that owns background, border, or hover fill. */
export const globalSearchGroupContentInsetClasses = 'px-3'

/** Parent-owned faint separators for flat and grouped result lists. Rows must be borderless. */
export const globalSearchResultListClasses =
  '[&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-border-faint'

export const globalSearchGroupSectionVariants = cva('', {
  variants: {
    state: {
      truncated: 'pb-4',
      complete: '',
    },
  },
  defaultVariants: {
    state: 'complete',
  },
})

export const globalSearchGroupHeadingVariants = cva('border-b border-border-subtle py-1', {
  variants: {
    surfaceContext: {
      preview: resolveGlobalSearchHeadingSurfaceClasses('preview'),
      page: resolveGlobalSearchHeadingSurfaceClasses('page'),
    },
    first: {
      true: 'pt-2',
      false: '',
    },
    follows: {
      none: '',
      complete: 'border-t border-border-subtle',
      truncated: '',
    },
  },
  defaultVariants: {
    surfaceContext: 'page',
    first: false,
    follows: 'none',
  },
})

/** Quiet match count suffix in group headings (`Content · 14`). */
export const globalSearchGroupHeadingCountClasses = 'font-normal tabular-nums text-muted-foreground'

const groupActionLinkBase =
  'relative flex w-full select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

/** Per-group overflow action when a section is truncated. */
export const globalSearchGroupShowAllLinkVariants = cva(
  `${groupActionLinkBase} mt-1 items-center py-1.5 text-xs font-body-emphasis`,
)

export type { GlobalSearchSurfaceContext }
