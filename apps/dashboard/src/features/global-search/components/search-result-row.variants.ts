import { cva } from 'class-variance-authority'

import { cn, interactiveRowVariants } from '@rpg/ui'

import { globalSearchGroupContentInsetClasses } from '../lib/global-search-group.variants'
import { resolveGlobalSearchRowHoverSurfaceClasses } from '../lib/global-search-surface.variants'
import type { GlobalSearchSurfaceContext } from '../lib/global-search-surface.variants'

export type SearchResultRowDensity = 'compact' | 'default'

export const searchResultRowVariants = cva('relative block w-full text-left transition-colors', {
  variants: {
    borderless: {
      true: `border-b-0 ${globalSearchGroupContentInsetClasses}`,
      false: cn(
        'border-b border-border px-3 sm:px-5',
        interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
      ),
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
})

export type { GlobalSearchSurfaceContext }
