import type { ReactNode } from 'react'

export type CatalogToolbarTab = {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

export type CatalogToolbarTabs = {
  items: readonly CatalogToolbarTab[]
  activeId: string
  onActiveIdChange: (id: string) => void
  position?: 'before-search' | 'after-search'
  ariaLabel?: string
}

export type CatalogToolbarSearch = {
  query: string
  onQueryChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

export type CatalogToolbarProps = {
  /** Omit to hide search — supports detail tabs with filters/sort only */
  search?: CatalogToolbarSearch

  tabs?: CatalogToolbarTabs

  primaryControls?: ReactNode

  filterRow?: {
    controls?: ReactNode
    actions?: ReactNode
  }

  actions?: ReactNode
}
