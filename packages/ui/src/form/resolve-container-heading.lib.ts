import type { GroupConfig, RowConfig, SlotConfig } from './field-config'
import type { FormHeading } from './form-heading.lib'
import { isNonWhitespaceLabel } from './form-heading.lib'

export function resolveGroupHeading(item: GroupConfig): FormHeading | undefined {
  if (!item.heading) return undefined
  if (!isNonWhitespaceLabel(item.heading.label)) return undefined
  return item.heading
}

export function hasNamedGroupHeading(item: GroupConfig): boolean {
  return resolveGroupHeading(item) !== undefined
}

export function resolveSlotHeading(config: SlotConfig): FormHeading | undefined {
  if (!config.heading) return undefined
  if (!isNonWhitespaceLabel(config.heading.label)) return undefined
  return config.heading
}

/** Resolves a row composite heading. */
export function resolveRowHeading(item: RowConfig): FormHeading | undefined {
  return item.heading
}
