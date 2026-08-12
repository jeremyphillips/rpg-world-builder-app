'use client'

import * as React from 'react'

import { CollapsibleListItem } from './collapsible-list-item'
import type {
  CatalogPickerCollapsibleRowRenderArgs,
  CatalogPickerRowLayout,
  CatalogPickerSheetProps,
} from './catalog-picker-sheet.types'
import type { CollapsibleListItemShellPreset } from './collapsible-list-item/collapsible-list-item-shell.client'
import type { SurfaceConfig } from './visual-vocabulary.types'
import { catalogPickerSheetListVariants } from './catalog-picker-sheet.variants'
import { resolveCollapsibleListItemDomIds } from './collapsible-list-item/collapsible-list-item.variants'

function resolveCollapsibleRowRenderArgs<TItem>({
  item,
  itemKey,
  toolbarLabel,
  renderItemSummary,
  renderItemDetails,
  expandedItemId,
  onExpandedItemChange,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  expandedItemId?: string | null
  onExpandedItemChange?: (itemId: string | null) => void
}): CatalogPickerCollapsibleRowRenderArgs<TItem> {
  const domIds = resolveCollapsibleListItemDomIds(itemKey)
  const hasDetails = Boolean(renderItemDetails)
  const controlledExpansion = expandedItemId !== undefined
  const isExpanded = controlledExpansion ? expandedItemId === itemKey : undefined

  return {
    item,
    itemKey,
    toolbarLabel,
    domIds,
    collapsible: hasDetails,
    collapsed: controlledExpansion ? !isExpanded : undefined,
    onToggleCollapse:
      controlledExpansion && onExpandedItemChange
        ? () => onExpandedItemChange(isExpanded ? null : itemKey)
        : undefined,
    summary: renderItemSummary?.(item),
    details: hasDetails ? renderItemDetails?.(item) : undefined,
  }
}

function CatalogPickerCollapsibleItemRow<TItem>({
  item,
  itemKey,
  toolbarLabel,
  renderItemHeader,
  renderCollapsibleRow,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
  rowPreset,
  rowLayout,
  rowSurface = { elevation: 'flat' },
  toolbarCompact = false,
  expandedItemId,
  onExpandedItemChange,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemHeader?: (item: TItem) => React.ReactNode
  renderCollapsibleRow?: (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => React.ReactNode
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemActions?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  rowPreset?: CollapsibleListItemShellPreset
  rowLayout?: CatalogPickerRowLayout
  rowSurface?: SurfaceConfig
  toolbarCompact?: boolean
  expandedItemId?: string | null
  onExpandedItemChange?: (itemId: string | null) => void
}) {
  if (renderCollapsibleRow) {
    return (
      <div data-picker-item-key={itemKey}>
        {renderCollapsibleRow(
          resolveCollapsibleRowRenderArgs({
            item,
            itemKey,
            toolbarLabel,
            renderItemSummary,
            renderItemDetails,
            expandedItemId,
            onExpandedItemChange,
          }),
        )}
      </div>
    )
  }

  const domIds = resolveCollapsibleListItemDomIds(itemKey)
  const hasDetails = Boolean(renderItemDetails)
  const controlledExpansion = expandedItemId !== undefined
  const isExpanded = controlledExpansion ? expandedItemId === itemKey : undefined

  return (
    <div data-picker-item-key={itemKey}>
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        preset={rowPreset}
        rowLayout={rowLayout}
        surface={rowSurface}
        toolbarCompact={toolbarCompact}
        actionsAlign="center"
        collapsible={hasDetails}
        showDragHandle={false}
        collapsed={controlledExpansion ? !isExpanded : undefined}
        onToggleCollapse={
          controlledExpansion && onExpandedItemChange
            ? () => onExpandedItemChange(isExpanded ? null : itemKey)
            : undefined
        }
        header={renderItemHeader!(item)}
        summary={renderItemSummary?.(item)}
        actions={renderItemActions?.(item)}
        body={hasDetails ? renderItemDetails?.(item) : undefined}
      />
    </div>
  )
}

export function CatalogPickerSheetResults<TItem>({
  items,
  getItemKey,
  rowProps,
}: {
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  rowProps: CatalogPickerSheetProps<TItem>
}) {
  return (
    <div className={catalogPickerSheetListVariants()} role="list">
      {items.map((item) => {
        const itemKey = getItemKey(item)

        return (
          <div key={itemKey} role="listitem">
            <CatalogPickerCollapsibleItemRow
              item={item}
              itemKey={itemKey}
              toolbarLabel={rowProps.getItemToolbarLabel?.(item) ?? itemKey}
              renderItemHeader={rowProps.renderItemHeader}
              renderCollapsibleRow={rowProps.renderCollapsibleRow}
              renderItemSummary={rowProps.renderItemSummary}
              renderItemActions={rowProps.renderItemActions}
              renderItemDetails={rowProps.renderItemDetails}
              rowPreset={rowProps.rowPreset}
              rowLayout={rowProps.rowLayout}
              rowSurface={rowProps.rowSurface}
              toolbarCompact={rowProps.toolbarCompact}
              expandedItemId={rowProps.expandedItemId}
              onExpandedItemChange={rowProps.onExpandedItemChange}
            />
          </div>
        )
      })}
    </div>
  )
}
