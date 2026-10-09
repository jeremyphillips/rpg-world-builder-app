import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { dialogPanelSectionInsetXClasses } from './dialog-panel.variants'

/** Catalog toolbar inset matches dialog-panel section inset (picker chrome, not a parallel SSOT). */
export const catalogToolbarVariants = cva(cn('space-y-4', dialogPanelSectionInsetXClasses))

export const catalogToolbarTabRowVariants = cva(
  'flex items-center justify-between gap-4 border-b border-border',
)

/**
 * Utility band. Content filters and the view stack share a line when they fit,
 * and the view stack wraps as one unit when they do not. Width follows the
 * container, not the viewport.
 */
export const catalogToolbarUtilityBandVariants = cva(
  '@container flex flex-wrap items-start justify-between gap-x-4 gap-y-2',
)

/** Lower content filters. Omitted by the toolbar when this region is empty. */
export const catalogToolbarUtilityContentVariants = cva(
  'flex w-fit max-w-full shrink-0 flex-wrap items-end gap-2',
)

/** Sort over Reset. The stack stays at the end of its line, and Reset aligns to its trailing edge. */
export const catalogToolbarViewControlsVariants = cva(
  'ml-auto flex w-fit shrink-0 flex-col items-end gap-2',
)

export const catalogToolbarStandaloneActionsVariants = cva('flex justify-end')
