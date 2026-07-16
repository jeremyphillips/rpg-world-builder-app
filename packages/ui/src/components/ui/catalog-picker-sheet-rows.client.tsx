'use client'

import * as React from 'react'

import { CollapsibleListItem } from './collapsible-list-item'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import type { CollapsibleListItemShellTone } from './collapsible-list-item/collapsible-list-item-shell.client'
import { catalogPickerSheetListVariants } from './catalog-picker-sheet.variants'

function CatalogPickerCollapsibleItemRow<TItem>({
  item,
  itemKey,
  toolbarLabel,
  renderItemHeader,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
  rowTone = 'main',
  toolbarCompact = false,
  rowBodyClassName,
  rowShellClassName,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemHeader: (item: TItem) => React.ReactNode
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemActions?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  rowTone?: CollapsibleListItemShellTone
  toolbarCompact?: boolean
  rowBodyClassName?: string
  rowShellClassName?: string
}) {
  const titleId = `${itemKey}-title`
  const bodyId = `${itemKey}-body`
  const [collapsed, setCollapsed] = React.useState(true)
  const hasDetails = Boolean(renderItemDetails)

  return (
    <div data-picker-item-key={itemKey}>
      <CollapsibleListItem
        itemId={itemKey}
        titleId={titleId}
        bodyId={bodyId}
        toolbarAriaLabel={toolbarLabel}
        tone={rowTone}
        toolbarCompact={toolbarCompact}
        className={rowShellClassName}
        bodyClassName={rowBodyClassName}
        actionsAlign="center"
        collapsible={hasDetails}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((current) => !current)}
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
              rowTone={rowProps.rowTone}
              toolbarCompact={rowProps.toolbarCompact}
              rowBodyClassName={rowProps.rowBodyClassName}
              rowShellClassName={rowProps.rowShellClassName}
            />
          </div>
        )
      })}
    </div>
  )
}
