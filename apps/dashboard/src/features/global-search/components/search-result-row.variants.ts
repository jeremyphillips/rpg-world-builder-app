import { cva } from 'class-variance-authority'

import { globalSearchGroupContentInsetClasses } from '../lib/global-search-group.variants'
import { resolveGlobalSearchRowHoverSurfaceClasses } from '../lib/global-search-surface.variants'
import type { GlobalSearchSurfaceContext } from '../lib/global-search-surface.variants'

export type SearchResultRowDensity = 'compact' | 'default'

export const searchResultRowVariants = cva(
  'block w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      borderless: {
        true: `border-b-0 ${globalSearchGroupContentInsetClasses}`,
        false: 'border-b border-border px-0 hover:bg-muted',
      },
      density: {
        compact: 'py-2',
        default: 'py-3',
      },
      surfaceContext: {
        preview: '',
        page: '',
      },
    },
    compoundVariants: [
      {
        borderless: true,
        surfaceContext: 'preview',
        class: resolveGlobalSearchRowHoverSurfaceClasses('preview'),
      },
      {
        borderless: true,
        surfaceContext: 'page',
        class: resolveGlobalSearchRowHoverSurfaceClasses('page'),
      },
    ],
    defaultVariants: {
      borderless: false,
      density: 'default',
      surfaceContext: 'page',
    },
  },
)

export type { GlobalSearchSurfaceContext }

export const searchResultRowHeaderVariants = cva('flex items-start justify-between gap-3')

export const searchResultRowTitleRowVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const searchResultRowTitleVariants = cva(
  'min-w-0 truncate text-sm font-semibold text-foreground',
)

export const searchResultRowTypeLabelVariants = cva('shrink-0 text-xs text-muted-foreground')

export const searchResultRowSecondaryVariants = cva('text-xs text-muted-foreground', {
  variants: {
    density: {
      compact: 'truncate',
      default: '',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})
