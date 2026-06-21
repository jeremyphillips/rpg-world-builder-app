import type { ComboboxFieldOption } from './combobox-field.types'

export function normalizeSelected(multiple: boolean, value: unknown): string[] {
  if (multiple) {
    return Array.isArray(value) ? value.map(String) : []
  }
  return value != null && value !== '' ? [String(value)] : []
}

export function optionMatchesQuery(option: ComboboxFieldOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    option.label.toLowerCase().includes(normalized) ||
    option.value.toLowerCase().includes(normalized) ||
    (option.description?.toLowerCase().includes(normalized) ?? false)
  )
}

export function filterOptions(
  options: ComboboxFieldOption[],
  query: string,
  selected: string[] = [],
): ComboboxFieldOption[] {
  const selectedSet = new Set(selected)
  const visible = options.filter(
    (option) => selectedSet.has(option.value) || optionMatchesQuery(option, query),
  )
  const visibleValues = new Set(visible.map((option) => option.value))
  for (const value of selected) {
    if (!visibleValues.has(value)) {
      visible.push(resolveOption(value, options))
    }
  }
  return visible
}

export function resolveOption(value: string, options: ComboboxFieldOption[]): ComboboxFieldOption {
  return options.find((option) => option.value === value) ?? { value, label: value }
}

export function nextMultiSelection(
  selected: string[],
  optionValue: string,
  max: number | undefined,
): string[] {
  if (selected.includes(optionValue)) return selected.filter((value) => value !== optionValue)
  if (max !== undefined && selected.length >= max) return selected
  return [...selected, optionValue]
}

export function resolveTriggerLabel(
  multiple: boolean,
  selected: string[],
  placeholder: string,
  options: ComboboxFieldOption[],
): string {
  if (multiple) {
    if (selected.length === 0) return placeholder
    return `${selected.length} selected`
  }
  if (selected.length === 0) return placeholder
  return resolveOption(selected[0]!, options).label
}

export function clampHighlightedIndex(activeIndex: number, optionCount: number): number {
  return optionCount === 0 ? 0 : Math.min(activeIndex, optionCount - 1)
}

export function isComboboxOptionDisabled(
  option: ComboboxFieldOption,
  multiple: boolean,
  atMax: boolean,
  isSelected: boolean,
): boolean {
  return Boolean(option.disabled || (multiple && atMax && !isSelected))
}

export function emitComboboxChange(
  multiple: boolean,
  nextSelected: string[],
  onChange?: (value: string | string[]) => void,
): void {
  if (multiple) {
    onChange?.(nextSelected)
    return
  }
  onChange?.(nextSelected[0] ?? '')
}

export function nextSingleSelection(selected: string[], optionValue: string): string[] {
  const nextValue = selected[0] === optionValue ? '' : optionValue
  return nextValue ? [nextValue] : []
}

export type ComboboxSearchKeyAction = 'next' | 'previous' | 'select' | 'close' | null

export function resolveSearchKeyAction(key: string): ComboboxSearchKeyAction {
  switch (key) {
    case 'ArrowDown':
      return 'next'
    case 'ArrowUp':
      return 'previous'
    case 'Enter':
      return 'select'
    case 'Escape':
      return 'close'
    default:
      return null
  }
}

export function nextHighlightedIndex(
  action: Extract<ComboboxSearchKeyAction, 'next' | 'previous'>,
  currentIndex: number,
  optionCount: number,
): number {
  if (optionCount === 0) return 0
  if (action === 'next') return Math.min(currentIndex + 1, optionCount - 1)
  return Math.max(currentIndex - 1, 0)
}
