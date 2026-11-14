import type { FormItem, RowConfig } from '../../field-config'
import { formItemsHaveVisibleRenderableFields } from '../form-item-visibility.lib'

/** Whether any item body field would render for the current row values. */
export function arrayItemHasVisibleBodyFields(
  items: readonly (FormItem | RowConfig)[],
  values: Record<string, unknown>,
): boolean {
  return formItemsHaveVisibleRenderableFields(items, values)
}
