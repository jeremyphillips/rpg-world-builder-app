import { singularizeLabel } from '@rpg/contracts'

import type {
  ArrayConfig,
  ArrayItemHeaderConfig,
  ArrayItemReorder,
  ArrayItemVariant,
  FormItem,
  RowConfig,
} from '../field-config'

const NESTED_ARRAY_SECTION_DEPTH = 2

export function isNestedArraySection(sectionDepth: number): boolean {
  return sectionDepth >= NESTED_ARRAY_SECTION_DEPTH
}

function isLeafField(item: FormItem | RowConfig): boolean {
  return !('kind' in item)
}

function isCompactEligible(fields: FormItem[]): boolean {
  return resolveCompactInlineRow(fields) !== undefined
}

/** Single leaf `row` container used by compact inline array items. */
export function resolveCompactInlineRow(fields: FormItem[]): RowConfig | undefined {
  if (fields.length !== 1) return undefined
  const only = fields[0]
  if (only === undefined || !('kind' in only) || only.kind !== 'row') return undefined
  if (!only.fields.every(isLeafField)) return undefined
  return only
}

export function resolveArrayItemVariant(
  config: ArrayConfig,
  options: { nested: boolean },
): Exclude<ArrayItemVariant, 'auto'> {
  const explicit = config.itemVariant ?? 'auto'
  if (options.nested) {
    // Nested sections default to compact; opt in to grant-style headers explicitly.
    if (explicit === 'detailed') return 'detailed'
    return 'compact'
  }
  if (explicit !== 'auto') return explicit
  return isCompactEligible(config.fields) ? 'compact' : 'detailed'
}

export function resolveArrayItemReorder(config: ArrayConfig): ArrayItemReorder {
  return config.reorder ?? 'dragHandle'
}

export function defaultArrayItemHeader(legend?: string): ArrayItemHeaderConfig {
  const itemLabel = legend ? singularizeLabel(legend) : 'Item'
  return {
    fallback: (index) => `${itemLabel} #${index + 1}`,
  }
}

export function resolveArrayItemHeader(
  config: ArrayConfig,
  legend?: string,
): ArrayItemHeaderConfig {
  return config.itemHeader ?? defaultArrayItemHeader(legend)
}

/** Middle-dot separator for array item header labels and summary segments. */
export const ARRAY_ITEM_TEXT_SEPARATOR = ' · '

/** Single middle dot rendered between primary and fallback header labels. */
export const ARRAY_ITEM_HEADER_DIVIDER = '·'

/** Joins non-empty summary/header segments with {@link ARRAY_ITEM_TEXT_SEPARATOR}. */
export function joinArrayItemSummaryParts(parts: readonly string[]): string {
  return parts.filter((part) => part.length > 0).join(ARRAY_ITEM_TEXT_SEPARATOR)
}

export function resolveArrayItemPrimaryLabel(
  header: ArrayItemHeaderConfig,
  values: Record<string, unknown>,
  index: number,
  watchedPrimary: unknown,
): string | undefined {
  if (header.primary) {
    return header.primary(values, index)
  }

  if (header.primaryField === undefined) return undefined

  const raw = watchedPrimary ?? values[header.primaryField]
  if (raw === undefined || raw === null || raw === '') return undefined

  if (header.formatPrimary) {
    return header.formatPrimary(raw, values)
  }

  return String(raw)
}

export interface ResolvedArrayItemHeader {
  primary?: string
  fallback: string
  ariaLabel: string
  showDivider: boolean
  /** When true, render fallback after primary in the visible header title. */
  showFallbackInTitle: boolean
  srOnly: boolean
}

export function resolveArrayItemHeaderLabels(
  header: ArrayItemHeaderConfig,
  values: Record<string, unknown>,
  index: number,
  watchedPrimary: unknown,
  legend: string,
): ResolvedArrayItemHeader {
  const primary = resolveArrayItemPrimaryLabel(header, values, index, watchedPrimary)
  const fallback = header.fallback(index)
  const showFallbackInHeader = header.showFallbackInHeader ?? false
  const showFallbackInTitle = showFallbackInHeader && Boolean(primary)
  const showDivider = showFallbackInTitle && (header.showDivider ?? true)
  const ariaLabel = primary
    ? showFallbackInHeader
      ? joinArrayItemSummaryParts([primary, fallback])
      : joinArrayItemSummaryParts([legend, primary])
    : joinArrayItemSummaryParts([legend, fallback])

  return {
    primary,
    fallback,
    ariaLabel,
    showDivider,
    showFallbackInTitle,
    srOnly: header.srOnly ?? false,
  }
}
