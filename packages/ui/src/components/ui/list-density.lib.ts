import { cn } from '../../lib/utils'

export { LIST_DENSITIES, UI_LIST_DENSITY_CLASSES, type ListDensity } from './list-density.tokens'
import type { ListDensity } from './list-density.tokens'

export function listShellClasses(density: ListDensity): string {
  return cn('ui-list', `ui-list--${density}`)
}
