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
  if (fields.length !== 1) return false
  const only = fields[0]
  if (only === undefined || !('kind' in only) || only.kind !== 'row') return false
  return only.fields.every(isLeafField)
}

export function resolveArrayItemVariant(
  config: ArrayConfig,
  options: { nested: boolean },
): Exclude<ArrayItemVariant, 'auto'> {
  if (options.nested) return 'compact'
  const explicit = config.itemVariant ?? 'auto'
  if (explicit !== 'auto') return explicit
  return isCompactEligible(config.fields) ? 'compact' : 'detailed'
}

export function resolveArrayItemReorder(config: ArrayConfig): ArrayItemReorder {
  return config.reorder ?? 'dragHandle'
}

export function defaultArrayItemHeader(): ArrayItemHeaderConfig {
  return {
    fallback: (index) => `Item ${index + 1}`,
  }
}

export function resolveArrayItemHeader(config: ArrayConfig): ArrayItemHeaderConfig {
  return config.itemHeader ?? defaultArrayItemHeader()
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
  const showDivider = header.showDivider ?? Boolean(primary)
  const ariaLabel = primary ? `${primary} — ${fallback}` : `${legend} — ${fallback}`

  return {
    primary,
    fallback,
    ariaLabel,
    showDivider,
    srOnly: header.srOnly ?? false,
  }
}
