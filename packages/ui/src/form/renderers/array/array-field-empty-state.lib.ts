import { arrayItemLabel } from '../../config/array/array-item-label.lib'
import { resolveArrayItemHeader } from '../../config/array/array-item-config.lib'
import { resolveArrayHeading } from '../../config/array/resolve-array-heading.lib'
import type { ArrayConfig } from '../../field-config'

export function resolveArrayEmptyItemLabel(config: ArrayConfig): string {
  const itemLegend = resolveArrayHeading(config)?.label ?? ''
  const header = resolveArrayItemHeader(config, itemLegend)
  return arrayItemLabel(header, itemLegend)
}

export function arrayEmptyStatePrimaryMessage(itemLabel: string): string {
  return `No ${itemLabel} added.`
}

/** Whether the array legend should show a required marker. */
export function resolveArrayRequiredMarker(config: ArrayConfig): boolean {
  return (config.min ?? 0) >= 1
}
