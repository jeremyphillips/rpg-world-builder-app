import { cn } from '../../lib/utils'

export { LIST_DENSITIES, UI_LIST_DENSITY_CLASSES, type ListDensity } from './list-density.tokens'
import type { ListDensity } from './list-density.tokens'

/** Popover-hosted interactive lists (combobox, dropdown, searchable unit select, link picker). */
export const POPOVER_INTERACTIVE_LIST_DENSITY = 'compact' as const satisfies ListDensity

export function listShellClasses(density: ListDensity): string {
  return cn('ui-list', `ui-list--${density}`)
}
