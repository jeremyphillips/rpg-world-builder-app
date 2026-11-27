import { readValueAt } from '../../errors/route-form-control-path-walk.lib'
import { resolveArrayItemFieldOrder } from '../../errors/resolve-field-order'
import type { ArrayConfig, FormItem } from '../../field-config'
import { resolveFieldsForRowVariantTopology } from './array-row-variant-topology.lib'

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
  const topology = config.item?.rowVariantTopology
  const resolver = config.item?.resolveFields
  const hasRow = row !== undefined && row !== null

  if (!hasRow) {
    if (topology) return resolveFieldsForRowVariantTopology(topology, row)
    return config.fields
  }

  if (topology && resolver) {
    try {
      return [...resolver(row, index)]
    } catch {
      return resolveFieldsForRowVariantTopology(topology, row)
    }
  }

  if (topology) return resolveFieldsForRowVariantTopology(topology, row)
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
