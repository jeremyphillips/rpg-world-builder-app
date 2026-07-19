'use client'

import * as React from 'react'

import { CollapsibleListItem } from './collapsible-list-item'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import type { CollapsibleListItemShellPreset } from './collapsible-list-item/collapsible-list-item-shell.client'
import type { FieldSurfaceVariant } from './field-surface.variants'
import { catalogPickerSheetListVariants } from './catalog-picker-sheet.variants'
import { resolveCollapsibleListItemDomIds } from './collapsible-list-item/collapsible-list-item.variants'

function CatalogPickerCollapsibleItemRow<TItem>({
  item,
  itemKey,
  toolbarLabel,
  renderItemHeader,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
  rowPreset,
  rowSurface = 'base',
  toolbarCompact = false,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemHeader: (item: TItem) => React.ReactNode
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemActions?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  rowPreset?: CollapsibleListItemShellPreset
  rowSurface?: FieldSurfaceVariant
  toolbarCompact?: boolean
}) {
  const domIds = resolveCollapsibleListItemDomIds(itemKey)
  const hasDetails = Boolean(renderItemDetails)

  return (
    <div data-picker-item-key={itemKey}>
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        preset={rowPreset}
        surface={rowSurface}
        toolbarCompact={toolbarCompact}
        actionsAlign="center"
        collapsible={hasDetails}
        showDragHandle={false}
        header={renderItemHeader(item)}
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
              renderItemSummary={rowProps.renderItemSummary}
              renderItemActions={rowProps.renderItemActions}
              renderItemDetails={rowProps.renderItemDetails}
              rowPreset={rowProps.rowPreset}
              rowSurface={rowProps.rowSurface}
              toolbarCompact={rowProps.toolbarCompact}
            />
          </div>
        )
      })}
    </div>
  )
}
