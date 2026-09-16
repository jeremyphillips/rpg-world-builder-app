import { arrayItemLabel } from '../../config/array/array-item-label.lib'
import { resolveArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayConfig } from '../../field-config'
import { resolveArrayHeading } from '../../resolve-container-heading.lib'

export function resolveArrayEmptyItemLabel(config: ArrayConfig): string {
  const legend = resolveArrayHeading(config)?.label ?? config.legend ?? config.name
  const header = resolveArrayItemHeader(config, legend)
  return arrayItemLabel(header, legend)
}

export function arrayEmptyStatePrimaryMessage(itemLabel: string): string {
  return `No ${itemLabel} added.`
}

/** Whether the array legend should show a required marker. */
export function resolveArrayRequiredMarker(config: ArrayConfig): boolean {
  return (config.min ?? 0) >= 1
}
