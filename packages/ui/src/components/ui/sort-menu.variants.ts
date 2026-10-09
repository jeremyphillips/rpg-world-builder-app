import { cn } from '../../lib/utils'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'

export const SORT_MENU_SIZING_LABEL_ATTR = 'data-sort-menu-sizing-label'

export const sortMenuTriggerSizerGridClasses = 'grid grid-cols-[minmax(0,max-content)] items-center'

export const sortMenuTriggerSizerGhostClasses =
  'invisible pointer-events-none col-start-1 row-start-1 whitespace-nowrap select-none'

export const sortMenuTriggerSizerLiveClasses =
  'col-start-1 row-start-1 min-w-0 truncate text-left font-medium'

export const sortMenuContentClasses = 'min-w-[12rem]'

export const sortMenuTriggerIconClasses = iconGlyphDescendantClasses.sm

export function sortMenuTriggerContentClasses(className?: string): string {
  return cn('inline-flex min-w-0 items-center gap-1.5', className)
}
