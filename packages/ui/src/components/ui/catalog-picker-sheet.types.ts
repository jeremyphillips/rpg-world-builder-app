import type { ReactNode } from 'react'

import type { CollapsibleListItemShellPreset } from './collapsible-list-item/collapsible-list-item-shell.client'
import type { CollapsibleListItemRowLayout } from './collapsible-list-item/collapsible-list-item.variants'
import type { SurfaceConfig } from './visual-vocabulary.types'
import type { CatalogToolbarTab, CatalogToolbarTabs } from './catalog-toolbar.types'

export type CatalogPickerTab = CatalogToolbarTab

export type CatalogPickerSheetActionsHelpers = {
  searchQuery: string
  activeTabId: string
  resetSearchQuery: () => void
  resetActiveTab: () => void
}

export type CatalogPickerRowLayout = CollapsibleListItemRowLayout

export type CatalogPickerSheetProps<TItem> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** Merged onto the sheet headline — defaults to card title (19px). */
  headlineClassName?: string
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  getSearchText: (item: TItem) => string
  renderItemHeader: (item: TItem) => ReactNode
  renderItemSummary?: (item: TItem) => ReactNode
  renderItemActions?: (item: TItem) => ReactNode
  renderItemDetails?: (item: TItem) => ReactNode
  /** Collapse button label suffix; defaults to `getItemKey`. */
  getItemToolbarLabel?: (item: TItem) => string
  tabs?: readonly CatalogPickerTab[]
  defaultTabId?: string
  getItemTab?: (item: TItem) => string
  /** When false (default), tabs and recommendation browse UI are not rendered. */
  recommendationsEnabled?: boolean
  /** Placement of recommendation tabs relative to search. Defaults to before-search. */
  recommendationTabsPosition?: CatalogToolbarTabs['position']
  /** Content between header description and toolbar (e.g. segmented mode control). */
  headerBelowDescription?: ReactNode
  /** Content below search and optional tabs (e.g. level chips). */
  primaryControls?: ReactNode
  filterRow?: {
    controls?: ReactNode | ((helpers: CatalogPickerSheetActionsHelpers) => ReactNode)
    actions?: ReactNode
  }
  actions?: ReactNode | ((helpers: CatalogPickerSheetActionsHelpers) => ReactNode)
  /** Restores sheet-managed search when `toolbarStateKey` changes. */
  initialSearchQuery?: string
  /** When this value changes, sheet search/tab state resets to defaults. */
  toolbarStateKey?: string
  transformVisibleItems?: (
    items: readonly TItem[],
    context: { searchQuery: string },
  ) => readonly TItem[]
  /** Domain-structured filters (category, affordability, etc.) — excludes search and tabs. */
  hasStructuredFilters?: boolean
  /** When set with `onExpandedItemChange`, only that row is expanded (exclusive). */
  expandedItemId?: string | null
  onExpandedItemChange?: (itemId: string | null) => void
  headerExtra?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  loading?: boolean
  searchPlaceholder?: string
  /** When true, search input is disabled (placeholder may still update). */
  searchDisabled?: boolean
  /**
   * When false, hides search toolbar and result list (header/footer-only
   * flows — no picker at all). Defaults to true. Ignored while
   * `bodyReplacement` is set, which takes precedence.
   */
  pickerEnabled?: boolean
  /**
   * When provided, replaces the search toolbar and result list with custom
   * scrollable body content (e.g. an inline create flow) while keeping the
   * sheet — and its search/tab state — mounted for the session. Takes
   * precedence over `pickerEnabled`.
   */
  bodyReplacement?: ReactNode
  noResultsMessage?: string
  noScopedItemsMessage?: string
  noItemsMessage?: string
  /** Collapsible row shell preset — equipment picker uses `catalog`. */
  rowPreset?: CollapsibleListItemShellPreset
  /** Row host layout — `entity-card` drops catalog content inset for embedded entity cards. */
  rowLayout?: CatalogPickerRowLayout
  /** Collapsible row surface config — defaults to flat canvas. */
  rowSurface?: SurfaceConfig
  /** Top-align caret/grip with the first header line for multi-line headers. */
  toolbarCompact?: boolean
  /** Optional class merged onto each collapsible row expanded body. */
  rowBodyClassName?: string
  /** Optional class merged onto each collapsible row shell (`role="group"`). */
  rowShellClassName?: string
}
