import {
  GLOBAL_SEARCH_FILTER_GROUPS,
  type GlobalSearchDocument,
  type GlobalSearchFilterGroup,
  type GlobalSearchUrlGroup,
} from '@rpg/contracts'
import { rankItems } from '@rpg/ui'

export type GlobalSearchGroupSection = {
  filterGroup: GlobalSearchFilterGroup
  items: GlobalSearchDocument[]
  totalCount: number
}

export function isGlobalSearchQueryBlank(query: string): boolean {
  return query.trim().length === 0
}

/** Rank catalog documents for a non-empty query; blank query yields no matches. */
export function rankGlobalSearchDocuments(
  documents: readonly GlobalSearchDocument[],
  query: string,
): GlobalSearchDocument[] {
  if (isGlobalSearchQueryBlank(query)) return []
  return rankItems([...documents], query)
}

export function filterGlobalSearchByGroup(
  documents: readonly GlobalSearchDocument[],
  group: GlobalSearchUrlGroup,
): GlobalSearchDocument[] {
  if (group === 'all') return [...documents]
  return documents.filter((document) => document.filterGroup === group)
}

export function groupRankedGlobalSearchDocuments(
  documents: readonly GlobalSearchDocument[],
): Map<GlobalSearchFilterGroup, GlobalSearchDocument[]> {
  const grouped = new Map<GlobalSearchFilterGroup, GlobalSearchDocument[]>()

  for (const document of documents) {
    const existing = grouped.get(document.filterGroup) ?? []
    existing.push(document)
    grouped.set(document.filterGroup, existing)
  }

  return grouped
}

export function buildGlobalSearchGroupSections(
  documents: readonly GlobalSearchDocument[],
  previewLimit: number,
): GlobalSearchGroupSection[] {
  const grouped = groupRankedGlobalSearchDocuments(documents)

  return GLOBAL_SEARCH_FILTER_GROUPS.flatMap((filterGroup) => {
    const allItems = grouped.get(filterGroup) ?? []
    if (allItems.length === 0) return []

    return [
      {
        filterGroup,
        items: allItems.slice(0, previewLimit),
        totalCount: allItems.length,
      },
    ]
  })
}
