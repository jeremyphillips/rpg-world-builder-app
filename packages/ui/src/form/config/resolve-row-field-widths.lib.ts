import type { FieldWidth } from '../../components/ui/field-control.variants'
import type { RowFieldItem } from '../field-config'

/** Resolves leaf width tokens for an anatomy row (defaults missing widths to `full`). */
export function resolveRowFieldWidths(items: readonly RowFieldItem[]): FieldWidth[] {
  return items.map((item) => item.width ?? 'full')
}
