import { readValueAt } from '../../errors/route-form-control-path-walk.lib'
import { resolveArrayItemFieldOrder } from '../../errors/resolve-field-order'
import type { ArrayConfig, FormItem } from '../../field-config'

/** Per-array-item field tree for validation routing and error labels. */
export type ArrayResolveFieldsFn = (row: unknown, index: number) => readonly FormItem[]

export function readArrayItemRows(
  formValues: Record<string, unknown> | undefined,
  arrayPath: string,
): unknown[] {
  if (!formValues) return []
  const value = readValueAt(formValues, arrayPath)
  return Array.isArray(value) ? value : []
}

export function resolveArrayRowFields(
  config: ArrayConfig,
  row: unknown,
  index: number,
): FormItem[] {
  const resolver = config.item?.resolveFields
  if (resolver) return [...resolver(row, index)]
  return config.fields
}

export function resolveArrayRowFieldOrder(
  config: ArrayConfig,
  row: unknown,
  index: number,
): string[] {
  return resolveArrayItemFieldOrder(resolveArrayRowFields(config, row, index))
}
