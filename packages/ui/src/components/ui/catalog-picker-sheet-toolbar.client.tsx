'use client'

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Input } from './input.client'
import { Tabs, TabsList, TabsTrigger } from './tabs.client'
import { Text } from './text'
import type {
  CatalogPickerSheetToolbarContext,
  CatalogPickerTab,
} from './catalog-picker-sheet.types'
import {
  catalogPickerSheetSearchRowVariants,
  catalogPickerSheetTabRowVariants,
  catalogPickerSheetToolbarVariants,
} from './catalog-picker-sheet.variants'

type CatalogPickerSheetToolbarProps = {
  title: string
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchPlaceholder: string
  tabs?: readonly CatalogPickerTab[]
  activeTabId: string
  onActiveTabIdChange: (tabId: string) => void
  onResetActiveTab: () => void
  tabCounts: Record<string, number>
  tabToolbarActions?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
  toolbarControls?: ReactNode | ((context: CatalogPickerSheetToolbarContext) => ReactNode)
}

export function CatalogPickerSheetToolbar({
  title,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  tabs,
  activeTabId,
  onActiveTabIdChange,
  onResetActiveTab,
  tabCounts,
  tabToolbarActions,
  toolbarControls,
}: CatalogPickerSheetToolbarProps) {
  const toolbarContext: CatalogPickerSheetToolbarContext = {
    searchQuery,
    setSearchQuery: onSearchQueryChange,
    clearSearchQuery: () => onSearchQueryChange(''),
    activeTabId,
    resetActiveTab: onResetActiveTab,
  }

  const renderedControls =
    typeof toolbarControls === 'function' ? toolbarControls(toolbarContext) : toolbarControls
  const renderedTabActions =
    typeof tabToolbarActions === 'function' ? tabToolbarActions(toolbarContext) : tabToolbarActions

  return (
    <div className={catalogPickerSheetToolbarVariants()}>
      {tabs && tabs.length > 0 ? (
        <div className={catalogPickerSheetTabRowVariants()}>
          <Tabs value={activeTabId} onValueChange={onActiveTabIdChange} className="min-w-0 flex-1">
            <TabsList aria-label={`${title} views`} className="w-full border-b-0">
              {tabs.map((tab) => {
                const count = tab.count ?? tabCounts[tab.id] ?? 0
                return (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                    <Text as="span" variant="muted" className="ml-1 tabular-nums">
                      ({count})
                    </Text>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
          {renderedTabActions ? <div className="shrink-0">{renderedTabActions}</div> : null}
        </div>
      ) : null}

      <div className={catalogPickerSheetSearchRowVariants()}>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {renderedControls ? <div>{renderedControls}</div> : null}
    </div>
  )
}
