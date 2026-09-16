import type { ArrayConfig, ArrayItemConfig } from '../../field-config'
import {
  normalizeArrayItemContent,
  type NormalizedArrayItemContent,
} from './array-item-content-normalizer.lib'
import { resolveArrayItemConfig } from './array-item-config.lib'

function warnCollapsibleCompact(path: string, item: ArrayItemConfig): void {
  if (!item.collapsible || item.variant !== 'compact') return
  console.warn(
    `[Form] "${path}" sets item.collapsible with item.variant: 'compact'. Collapsible items render as disclosure — omit variant: 'compact' or set collapsible: false.`,
  )
}

function warnCollapsibleHiddenHeader(path: string, item: ArrayItemConfig): void {
  if (!item.collapsible || item.headerVisibility !== 'hidden') return
  console.warn(
    `[Form] "${path}" sets item.headerVisibility: 'hidden' with item.collapsible: true. Disclosure requires header anatomy — headerVisibility is normalized to 'auto'.`,
  )
}

function warnPrimaryFieldOnHiddenInlineRow(
  path: string,
  item: ArrayItemConfig,
  normalized: NormalizedArrayItemContent,
): void {
  if (item.headerVisibility !== 'hidden' || !item.header?.primaryField) return
  if (normalized.contentLayout !== 'inline') return
  console.warn(
    `[Form] "${path}" sets item.header.primaryField with headerVisibility: 'hidden' on an inline row. primaryField does not render a visible item header for inline items.`,
  )
}

/** Dev-only guard for invalid or misleading `item.*` combinations on array fields. */
export function assertArrayItemConfig(config: ArrayConfig, legend: string): void {
  if (process.env.NODE_ENV === 'production') return

  const item = resolveArrayItemConfig(config)
  const path = config.name || legend || 'array'
  const normalized = normalizeArrayItemContent(config.fields)

  warnCollapsibleCompact(path, item)
  warnCollapsibleHiddenHeader(path, item)
  warnPrimaryFieldOnHiddenInlineRow(path, item, normalized)
}
