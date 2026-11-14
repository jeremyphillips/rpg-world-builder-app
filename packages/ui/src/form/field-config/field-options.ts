import type { PickerSearchOptions } from '../../lib/picker-search.types'

/** Trailing metadata for select option rows and the closed trigger (not combobox v1). */
export type SelectOptionTrailing = {
  text: string
  variant?: 'strong' | 'quiet'
}

/** Option for the `select`, `radio`, `radioCard`, `chips`, and `combobox` field types. */
export interface FieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Shown in select panels when the option is disabled (e.g. "Already used"). */
  disabledReason?: string
  /** Inline trailing metadata for select rows and the closed trigger. Not persisted. */
  trailing?: SelectOptionTrailing
  /** Secondary line text (e.g. source badge copy). Included in combobox search when opted in. */
  description?: string
  /** Additional searchable strings (aliases, semantic terms). Matched as keywords in combobox search. */
  searchTerms?: readonly string[]
  /** Alternative names matched as keywords in combobox search. */
  aliases?: readonly string[]
  /** Controls whether `description` is indexed for combobox search (omitted → indexed when description is set). */
  search?: PickerSearchOptions
  /** Optional classification shown inline after the label in combobox panels. */
  classification?: string
  /** Canonical dimension slugs matched by combobox `filterSelects` (AND across active keys). */
  filterValues?: Readonly<Record<string, string>>
  /** Inline title badge rendered by `radioCard` fields; ignored by other option controls. */
  badge?: string
}

/** Labeled option group for `select` fields (rendered as `<optgroup>`-style sections). */
export interface FieldOptionGroup {
  kind: 'group'
  label: string
  options: FieldOption[]
}

export type SelectFieldOptionListItem = FieldOption | FieldOptionGroup

export function isFieldOptionGroup(item: SelectFieldOptionListItem): item is FieldOptionGroup {
  return 'kind' in item && item.kind === 'group'
}

/** Flattens grouped select config items to a plain option list. */
export function flattenSelectFieldOptions(
  options: readonly SelectFieldOptionListItem[],
): FieldOption[] {
  return options.flatMap((item) => (isFieldOptionGroup(item) ? item.options : [item]))
}
/**
 * Builds `FieldOption[]` from a value list (typically a contract enum constant)
 * and a label map. Keying the labels by the value union makes a missing or
 * stale label a type error when the contract enum changes.
 */
export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): FieldOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}
export interface FieldOptionAvailability {
  dependsOn: string[]
  enabledWhen: (values: Record<string, unknown>, optionValue: string) => boolean
}
