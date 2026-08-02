import type { GlobalSearchGroupSection } from './rank-global-search'

export type GlobalSearchPreviewGroupState = 'truncated' | 'complete'

export type GlobalSearchPreviewGroupFollows = 'none' | GlobalSearchPreviewGroupState

export function deriveGlobalSearchPreviewGroupState(
  section: GlobalSearchGroupSection,
): GlobalSearchPreviewGroupState {
  return section.totalCount > section.items.length ? 'truncated' : 'complete'
}

export function deriveGlobalSearchPreviewGroupFollows(
  sections: readonly GlobalSearchGroupSection[],
  index: number,
): GlobalSearchPreviewGroupFollows {
  if (index === 0) return 'none'
  return deriveGlobalSearchPreviewGroupState(sections[index - 1]!)
}
