import { cva } from 'class-variance-authority'

import { resolveGlobalSearchRowHoverSurfaceClasses } from '../lib/global-search-surface.variants'
import type { GlobalSearchSurfaceContext } from '../lib/global-search-surface.variants'

export type SearchResultRowDensity = 'compact' | 'default'

export const searchResultRowVariants = cva('relative block w-full text-left transition-colors', {
  variants: {
    borderless: {
      true: 'border-b-0 px-3',
      false: 'border-b border-border px-3 hover:bg-muted sm:px-5',
    },
    density: {
      compact: '',
      default: '',
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
})

export type { GlobalSearchSurfaceContext }
