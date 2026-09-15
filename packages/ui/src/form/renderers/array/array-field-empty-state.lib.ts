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

export function arrayEmptyStateMinRequiredMessage(itemLabel: string): string {
  return `At least one ${itemLabel} is required.`
}
