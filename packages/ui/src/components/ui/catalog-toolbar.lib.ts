import type { ReactNode } from 'react'

import type { CatalogToolbarProps } from './catalog-toolbar.types'

export type CatalogToolbarLayout = {
  hasTabs: boolean
  tabsBeforeSearch: boolean
  tabsAfterSearch: boolean
  showFilterRow: boolean
  trailingActions?: ReactNode
}

export function resolveCatalogToolbarLayout({
  tabs,
  filterRow,
  actions,
}: Pick<CatalogToolbarProps, 'tabs' | 'filterRow' | 'actions'>): CatalogToolbarLayout {
  const hasTabs = Boolean(tabs && tabs.items.length > 0)

  return {
    hasTabs,
    tabsBeforeSearch: hasTabs && tabs?.position !== 'after-search',
    tabsAfterSearch: hasTabs && tabs?.position === 'after-search',
    showFilterRow: Boolean(filterRow?.controls || filterRow?.actions),
    trailingActions: actions && !hasTabs ? actions : undefined,
  }
}
