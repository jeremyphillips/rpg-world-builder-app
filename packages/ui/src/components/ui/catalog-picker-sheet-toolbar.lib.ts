import type { ReactNode } from 'react'

import type {
  CatalogPickerSheetActionsHelpers,
  CatalogPickerSheetProps,
  CatalogPickerTab,
} from './catalog-picker-sheet.types'
import type { CatalogToolbarTabs } from './catalog-toolbar.types'

type CatalogPickerSheetToolbarAdapterProps<TItem> = {
  title: string
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchPlaceholder: string
  tabs?: readonly CatalogPickerTab[]
  recommendationsEnabled: boolean
  recommendationTabsPosition: CatalogToolbarTabs['position']
  activeTabId: string
  onActiveTabIdChange: (tabId: string) => void
  tabCounts: Record<string, number>
  primaryControls?: ReactNode
  filterRow?: CatalogPickerSheetProps<TItem>['filterRow']
  actions?: CatalogPickerSheetProps<TItem>['actions']
  actionHelpers: CatalogPickerSheetActionsHelpers
}

export function resolveCatalogPickerSheetToolbarTabs({
  title,
  tabs,
  recommendationsEnabled,
  recommendationTabsPosition,
  activeTabId,
  onActiveTabIdChange,
  tabCounts,
}: Pick<
  CatalogPickerSheetToolbarAdapterProps<unknown>,
  | 'title'
  | 'tabs'
  | 'recommendationsEnabled'
  | 'recommendationTabsPosition'
  | 'activeTabId'
  | 'onActiveTabIdChange'
  | 'tabCounts'
>): CatalogToolbarTabs | undefined {
  if (!recommendationsEnabled || !tabs || tabs.length === 0) return undefined

  return {
    items: tabs.map((tab) => ({
      ...tab,
      count: tab.count ?? tabCounts[tab.id] ?? 0,
    })),
    activeId: activeTabId,
    onActiveIdChange: onActiveTabIdChange,
    position: recommendationTabsPosition,
    ariaLabel: `${title} views`,
  }
}

export function resolveCatalogPickerSheetRenderedActions(
  actions: CatalogPickerSheetProps<unknown>['actions'],
  actionHelpers: CatalogPickerSheetActionsHelpers,
): ReactNode {
  return typeof actions === 'function' ? actions(actionHelpers) : actions
}

export function resolveCatalogPickerSheetFilterRow<TItem>(
  filterRow: CatalogPickerSheetProps<TItem>['filterRow'],
  actionHelpers: CatalogPickerSheetActionsHelpers,
): { controls?: ReactNode; actions?: ReactNode } | undefined {
  if (!filterRow) return undefined

  const controls =
    typeof filterRow.controls === 'function'
      ? filterRow.controls(actionHelpers)
      : filterRow.controls

  if (!controls && !filterRow.actions) return undefined

  return {
    controls,
    actions: filterRow.actions,
  }
}
