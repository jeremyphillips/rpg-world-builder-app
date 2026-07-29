import { rankLegacySearchItems } from '../../lib/search-document.lib'
import type { WeightedSearchField } from '../../lib/search'
import {
  clampHighlightedIndex,
  nextHighlightedIndex,
  resolveSearchKeyAction,
} from './combobox-field.lib'
import type { ButtonDropdownGroup, ButtonDropdownItem } from './button-dropdown.types'

export type ButtonDropdownSearchableItem = ButtonDropdownItem & {
  fields: WeightedSearchField[]
}

export function buildButtonDropdownSearchFields(
  item: ButtonDropdownItem,
  groupLabelById: ReadonlyMap<string, string>,
): WeightedSearchField[] {
  const fields: WeightedSearchField[] = [{ text: item.label, weight: 1, role: 'label' }]
  if (item.description) {
    fields.push({ text: item.description, weight: 1, role: 'description' })
  }
  if (item.groupId) {
    const groupLabel = groupLabelById.get(item.groupId)
    if (groupLabel) fields.push({ text: groupLabel, weight: 1, role: 'group' })
  }
  if (item.searchTerms?.length) fields.push(...item.searchTerms)
  return fields
}

export function orderButtonDropdownItemsGrouped(
  items: readonly ButtonDropdownItem[],
  groups: readonly ButtonDropdownGroup[],
): ButtonDropdownItem[] {
  const byGroup = new Map<string, ButtonDropdownItem[]>()
  const ungrouped: ButtonDropdownItem[] = []
  const knownGroupIds = new Set(groups.map((group) => group.id))

  for (const item of items) {
    if (item.groupId && knownGroupIds.has(item.groupId)) {
      const list = byGroup.get(item.groupId) ?? []
      list.push(item)
      byGroup.set(item.groupId, list)
      continue
    }
    ungrouped.push(item)
  }

  const ordered: ButtonDropdownItem[] = []
  for (const group of groups) {
    ordered.push(...(byGroup.get(group.id) ?? []))
  }
  ordered.push(...ungrouped)
  return ordered
}

export function rankButtonDropdownItems(
  items: readonly ButtonDropdownItem[],
  groups: readonly ButtonDropdownGroup[],
  query: string,
): ButtonDropdownItem[] {
  const normalized = query.trim()
  if (!normalized) return orderButtonDropdownItemsGrouped(items, groups)

  const groupLabelById = new Map(groups.map((group) => [group.id, group.label]))
  const searchable: ButtonDropdownSearchableItem[] = items.map((item) => ({
    ...item,
    fields: buildButtonDropdownSearchFields(item, groupLabelById),
  }))
  return rankLegacySearchItems(searchable, query, 'forgiving')
}

export function isButtonDropdownSearchActive(query: string): boolean {
  return query.trim().length > 0
}

export function selectableButtonDropdownItems(
  items: readonly ButtonDropdownItem[],
): ButtonDropdownItem[] {
  return items.filter((item) => !item.disabled)
}

export { clampHighlightedIndex, nextHighlightedIndex, resolveSearchKeyAction }
