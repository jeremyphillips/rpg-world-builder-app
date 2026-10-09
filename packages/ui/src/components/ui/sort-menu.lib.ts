import type { SortMenuOption, SortMenuSection } from './sort-menu.types'

export const SORT_MENU_DEFAULT_LABEL = 'Sort by'

export function sortMenuFlatSections<T extends string>(
  options: readonly SortMenuOption<T>[],
): SortMenuSection<T>[] {
  return [{ type: 'ungrouped', options }]
}

export function flattenSortMenuOptions<T extends string>(
  sections: readonly SortMenuSection<T>[],
): SortMenuOption<T>[] {
  return sections.flatMap((section) => section.options)
}

export function resolveSortMenuTriggerLabel<T extends string>(
  sections: readonly SortMenuSection<T>[],
  value: T,
): string | undefined {
  return flattenSortMenuOptions(sections).find((option) => option.value === value)?.triggerLabel
}

export function resolveSortMenuTriggerAccessibleName(label: string, triggerLabel: string): string {
  return `${label}, ${triggerLabel}`
}

export function collectSortMenuSizingLabels<T extends string>(
  sections: readonly SortMenuSection<T>[],
): string[] {
  return [...new Set(flattenSortMenuOptions(sections).map((option) => option.triggerLabel))]
}

export function assertSortMenuValueInOptions<T extends string>(
  sections: readonly SortMenuSection<T>[],
  value: T,
): boolean {
  const valid = flattenSortMenuOptions(sections).some((option) => option.value === value)
  if (!valid && process.env.NODE_ENV !== 'production') {
    console.warn(`SortMenu: controlled value "${value}" is not in the current option set.`)
  }
  return valid
}
