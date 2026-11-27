import type { TabbedFormTab } from '@rpg/ui/form'

export const CONTENT_FORM_TAB_SEARCH_PARAM = 'tab'

export function resolveContentFormTabFromSearch(
  tabs: readonly TabbedFormTab[] | undefined,
  tabParam: string | null,
): string | undefined {
  if (!tabs?.length || !tabParam) return undefined
  return tabs.some((tab) => tab.id === tabParam) ? tabParam : undefined
}
