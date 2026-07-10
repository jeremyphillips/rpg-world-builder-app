'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { CollapsibleListItem } from './collapsible-list-item'
import type { CatalogPickerSheetProps } from './catalog-picker-sheet.types'
import { usesCatalogPickerCollapsibleRows } from './catalog-picker-sheet.types'
import {
  catalogPickerSheetItemDetailsVariants,
  catalogPickerSheetItemMainVariants,
  catalogPickerSheetItemVariants,
  catalogPickerSheetListVariants,
} from './catalog-picker-sheet.variants'

function CatalogPickerLegacyItemRow<TItem>({
  item,
  itemKey,
  renderItem,
  renderItemDetails,
}: {
  item: TItem
  itemKey: string
  renderItem: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
}) {
  const detailsId = `${itemKey}-details`
  const [expanded, setExpanded] = React.useState(false)
  const hasDetails = Boolean(renderItemDetails)

  return (
    <article className={catalogPickerSheetItemVariants()} data-picker-item-key={itemKey}>
      <div className={catalogPickerSheetItemMainVariants()}>
        <div className="min-w-0 flex-1">{renderItem(item)}</div>
        {hasDetails ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={expanded ? 'Hide details' : 'Show details'}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                expanded ? 'rotate-180' : undefined,
              )}
              aria-hidden
            />
          </Button>
        ) : null}
      </div>
      {hasDetails && expanded ? (
        <div id={detailsId} className={catalogPickerSheetItemDetailsVariants()}>
          {renderItemDetails?.(item)}
        </div>
      ) : null}
    </article>
  )
}

function CatalogPickerCollapsibleItemRow<TItem>({
  item,
  itemKey,
  toolbarLabel,
  renderItemHeader,
  renderItemSummary,
  renderItemActions,
  renderItemDetails,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemHeader: (item: TItem) => React.ReactNode
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemActions?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
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
        tone="main"
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
  const collapsibleRows = usesCatalogPickerCollapsibleRows(rowProps)

  return (
    <div className={catalogPickerSheetListVariants()} role="list">
      {items.map((item) => {
        const itemKey = getItemKey(item)

        return (
          <div key={itemKey} role="listitem">
            {collapsibleRows ? (
              <CatalogPickerCollapsibleItemRow
                item={item}
                itemKey={itemKey}
                toolbarLabel={rowProps.getItemToolbarLabel?.(item) ?? itemKey}
                renderItemHeader={rowProps.renderItemHeader}
                renderItemSummary={rowProps.renderItemSummary}
                renderItemActions={rowProps.renderItemActions}
                renderItemDetails={rowProps.renderItemDetails}
              />
            ) : (
              <CatalogPickerLegacyItemRow
                item={item}
                itemKey={itemKey}
                renderItem={rowProps.renderItem}
                renderItemDetails={rowProps.renderItemDetails}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
