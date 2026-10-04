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

function useCatalogPickerRowExpansion(
  itemKey: string,
  expandedItemId: string | null | undefined,
  onExpandedItemChange: ((itemId: string | null) => void) | undefined,
) {
  const controlledExpansion = expandedItemId !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(false)
  const isExpanded = controlledExpansion ? expandedItemId === itemKey : uncontrolledExpanded

  const onToggleCollapse = React.useCallback(() => {
    if (controlledExpansion) {
      onExpandedItemChange?.(isExpanded ? null : itemKey)
      return
    }
    setUncontrolledExpanded((current) => !current)
  }, [controlledExpansion, isExpanded, itemKey, onExpandedItemChange])

  return { isExpanded, onToggleCollapse }
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
  const { isExpanded, onToggleCollapse } = useCatalogPickerRowExpansion(
    itemKey,
    expandedItemId,
    onExpandedItemChange,
  )
  const domIds = resolveCollapsibleListItemDomIds(itemKey)
  const hasDetails = Boolean(renderItemDetails)
  const details = isExpanded ? renderItemDetails?.(item) : undefined

  if (renderCollapsibleRow) {
    return (
      <div data-picker-item-key={itemKey}>
        {renderCollapsibleRow({
          item,
          itemKey,
          toolbarLabel,
          domIds,
          collapsible: hasDetails,
          collapsed: !isExpanded,
          onToggleCollapse,
          summary: renderItemSummary?.(item),
          details,
        })}
      </div>
    )
  }

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
        collapsible={hasDetails}
        showDragHandle={false}
        collapsed={!isExpanded}
        onToggleCollapse={onToggleCollapse}
        header={renderItemHeader!(item)}
        summary={renderItemSummary?.(item)}
        actions={renderItemActions?.(item)}
        body={details}
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
