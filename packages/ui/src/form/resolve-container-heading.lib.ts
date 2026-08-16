import type { ArrayConfig, GroupConfig, RowConfig, SlotConfig } from './field-config'
import type { FormHeading } from './form-heading.lib'
import { isNonWhitespaceLabel } from './form-heading.lib'

/** Resolves a group heading from new or deprecated props. */
export function resolveGroupHeading(item: GroupConfig): FormHeading | undefined {
  if (item.heading) return item.heading
  if (isNonWhitespaceLabel(item.legend)) {
    return { label: item.legend, hint: item.description }
  }
  return undefined
}

export function hasNamedGroupHeading(item: GroupConfig): boolean {
  return resolveGroupHeading(item) !== undefined
}

/** Resolves a slot heading from new or deprecated props. */
export function resolveSlotHeading(config: SlotConfig): FormHeading | undefined {
  if (config.heading) return config.heading
  if (isNonWhitespaceLabel(config.label)) {
    return { label: config.label, hint: config.hint }
  }
  return undefined
}

/** Resolves a row composite heading. */
export function resolveRowHeading(item: RowConfig): FormHeading | undefined {
  return item.heading
}

/** Resolves an array heading from new or deprecated props. */
export function resolveArrayHeading(config: ArrayConfig): FormHeading | undefined {
  if (config.heading) return config.heading
  if (isNonWhitespaceLabel(config.legend)) {
    return { label: config.legend }
  }
  return undefined
}

export function hasNamedArrayHeading(config: ArrayConfig): boolean {
  return resolveArrayHeading(config) !== undefined
}
