/**
 * Pure helpers for `ArrayConfig.addActionMenu` presentation and append resolution.
 *
 * Evaluates duplicate-policy states against current row values and maps
 * configured menu items to `ButtonDropdown` item props at render time.
 */
import type { WeightedSearchField } from '../../lib/search'

export type ArrayAddMenuDuplicatePolicy = 'allow' | 'warn' | 'block'

export type ArrayAddMenuItemConfig = {
  id: string
  label: string
  description?: string
  groupId?: string
  searchTerms?: WeightedSearchField[]
  appendDefaults: Record<string, unknown> | (() => Record<string, unknown>)
  isDuplicate?: (items: unknown[]) => boolean
  duplicatePolicy?: ArrayAddMenuDuplicatePolicy
}

export type ArrayAddMenuConfig = {
  groups: { id: string; label: string }[]
  items: ArrayAddMenuItemConfig[]
  enableSearch?: boolean
}

export function resolveArrayAddMenuAppendDefaults(
  appendDefaults: Record<string, unknown> | (() => Record<string, unknown>),
): Record<string, unknown> {
  return typeof appendDefaults === 'function' ? appendDefaults() : appendDefaults
}

export function resolveArrayAddMenuItemPresentation(
  item: ArrayAddMenuItemConfig,
  currentItems: unknown[],
): { disabled: boolean; note?: string } {
  const isDuplicate = item.isDuplicate?.(currentItems) ?? false
  const policy = item.duplicatePolicy ?? 'allow'
  if (!isDuplicate || policy === 'allow') {
    return { disabled: false }
  }
  const note = 'Already added'
  if (policy === 'block') {
    return { disabled: true, note }
  }
  return { disabled: false, note }
}

export function buildArrayAddMenuItems(
  addActionMenu: ArrayAddMenuConfig,
  currentItems: unknown[],
): Array<{
  id: string
  label: string
  description?: string
  groupId?: string
  searchTerms?: WeightedSearchField[]
  disabled?: boolean
  note?: string
}> {
  return addActionMenu.items.map((item) => {
    const presentation = resolveArrayAddMenuItemPresentation(item, currentItems)
    return {
      id: item.id,
      label: item.label,
      description: item.description,
      groupId: item.groupId,
      searchTerms: item.searchTerms,
      disabled: presentation.disabled,
      note: presentation.note,
    }
  })
}
