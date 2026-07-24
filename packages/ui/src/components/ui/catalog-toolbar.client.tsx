'use client'

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Input } from './input.client'
import { Tabs, TabsList, TabsTrigger } from './tabs.client'
import { Text } from './text'
import type {
  CatalogToolbarProps,
  CatalogToolbarSearch,
  CatalogToolbarTab,
  CatalogToolbarTabs,
} from './catalog-toolbar.types'
import { cn } from '../../lib/utils'
import { resolveCatalogToolbarLayout } from './catalog-toolbar.lib'
import {
  catalogToolbarFilterActionsVariants,
  catalogToolbarFilterControlsVariants,
  catalogToolbarFilterRowVariants,
  catalogToolbarSearchRowVariants,
  catalogToolbarStandaloneActionsVariants,
  catalogToolbarTabRowVariants,
  catalogToolbarVariants,
} from './catalog-toolbar.variants'
import { FILTER_DENSITY_DEFAULT } from '../../filters/filter-bar.variants'
import { FilterChromeProvider, useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { resolveFilterChromePresentation } from '../../filters/filter-presentation.lib'
import type { FilterDensity } from '../../filters/filter-schema.types'

function CatalogToolbarTabTrigger({ tab }: { tab: CatalogToolbarTab }) {
  const count = tab.count ?? 0

  return (
    <TabsTrigger value={tab.id} disabled={tab.disabled}>
      {tab.label}
      <Text as="span" variant="muted" className="ml-1 tabular-nums">
        ({count})
      </Text>
    </TabsTrigger>
  )
}

function CatalogToolbarTabRow({
  tabs,
  actions,
}: {
  tabs: CatalogToolbarTabs
  actions?: ReactNode
}) {
  return (
    <div className={catalogToolbarTabRowVariants()}>
      <Tabs value={tabs.activeId} onValueChange={tabs.onActiveIdChange} className="min-w-0 flex-1">
        <TabsList aria-label={tabs.ariaLabel ?? 'Catalog views'} className="w-full border-b-0">
          {tabs.items.map((tab) => (
            <CatalogToolbarTabTrigger key={tab.id} tab={tab} />
          ))}
        </TabsList>
      </Tabs>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}

function CatalogToolbarSearchField({
  search,
  controlSize,
}: {
  search: CatalogToolbarSearch
  controlSize: 'sm' | 'md'
}) {
  return (
    <div className={catalogToolbarSearchRowVariants()}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={search.query}
        onChange={(event) => search.onQueryChange(event.target.value)}
        placeholder={search.placeholder}
        aria-label={search.ariaLabel ?? search.placeholder}
        className="pl-9"
        size={controlSize}
      />
    </div>
  )
}

function CatalogToolbarFilterRow({
  filterRow,
  trailingActions,
}: {
  filterRow: NonNullable<CatalogToolbarProps['filterRow']>
  trailingActions?: ReactNode
}) {
  return (
    <div className={catalogToolbarFilterRowVariants()}>
      {filterRow.controls ? (
        <div className={catalogToolbarFilterControlsVariants()}>{filterRow.controls}</div>
      ) : null}
      {filterRow.actions || trailingActions ? (
        <div className={catalogToolbarFilterActionsVariants()}>
          {filterRow.actions}
          {trailingActions}
        </div>
      ) : null}
    </div>
  )
}

function CatalogToolbarStandaloneActions({ actions }: { actions: ReactNode }) {
  return <div className={catalogToolbarStandaloneActionsVariants()}>{actions}</div>
}

function CatalogToolbarLayoutContent({
  className,
  layout,
  tabRow,
  search,
  controlSize,
  primaryControls,
  filterRow,
}: {
  className?: string
  layout: ReturnType<typeof resolveCatalogToolbarLayout>
  tabRow: ReactNode
  search?: CatalogToolbarSearch
  controlSize: 'sm' | 'md'
  primaryControls?: ReactNode
  filterRow?: CatalogToolbarProps['filterRow']
}) {
  return (
    <div className={cn(catalogToolbarVariants(), className)}>
      {layout.tabsBeforeSearch ? tabRow : null}
      {search ? <CatalogToolbarSearchField search={search} controlSize={controlSize} /> : null}
      {layout.tabsAfterSearch ? tabRow : null}
      {primaryControls ? <div>{primaryControls}</div> : null}
      {layout.showFilterRow && filterRow ? (
        <CatalogToolbarFilterRow filterRow={filterRow} trailingActions={layout.trailingActions} />
      ) : layout.trailingActions ? (
        <CatalogToolbarStandaloneActions actions={layout.trailingActions} />
      ) : null}
    </div>
  )
}

export function CatalogToolbar({
  className,
  density,
  search,
  tabs,
  primaryControls,
  filterRow,
  actions,
}: CatalogToolbarProps) {
  const parentChrome = useOptionalFilterChrome()
  const resolvedDensity: FilterDensity = density ?? parentChrome?.density ?? FILTER_DENSITY_DEFAULT
  const presentation = resolveFilterChromePresentation({ density: resolvedDensity })
  const layout = resolveCatalogToolbarLayout({ tabs, filterRow, actions })
  const tabRow =
    layout.hasTabs && tabs ? <CatalogToolbarTabRow tabs={tabs} actions={actions} /> : null

  return (
    <FilterChromeProvider density={resolvedDensity}>
      <CatalogToolbarLayoutContent
        className={className}
        layout={layout}
        tabRow={tabRow}
        search={search}
        controlSize={presentation.controlSize}
        primaryControls={primaryControls}
        filterRow={filterRow}
      />
    </FilterChromeProvider>
  )
}
