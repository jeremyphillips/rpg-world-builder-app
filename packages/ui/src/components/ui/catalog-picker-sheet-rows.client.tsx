'use client'

import * as React from 'react'

import { CollapsibleListItem } from './collapsible-list-item'
import { RadioGroup } from './radio-group.client'
import type {
  CatalogPickerCollapsibleRowRenderArgs,
  CatalogPickerSheetProps,
  CatalogPickerSheetSelection,
} from './catalog-picker-sheet.types'
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
  expandedItemId,
  onExpandedItemChange,
  selection,
}: {
  item: TItem
  itemKey: string
  toolbarLabel: string
  renderItemHeader?: (item: TItem) => React.ReactNode
  renderCollapsibleRow?: (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => React.ReactNode
  renderItemSummary?: (item: TItem) => React.ReactNode
  renderItemActions?: (item: TItem) => React.ReactNode
  renderItemDetails?: (item: TItem) => React.ReactNode
  expandedItemId?: string | null
  onExpandedItemChange?: (itemId: string | null) => void
  selection?: CatalogPickerSheetSelection<TItem>
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
      <>
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
          selection: selection
            ? {
                value: itemKey,
                disabled: selection.isItemDisabled?.(item) ?? false,
              }
            : undefined,
        })}
      </>
    )
  }

  return (
    <>
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        preset="catalog"
        rowLayout="default"
        surface={{ elevation: 'flat' }}
        toolbarCompact={false}
        collapsible={hasDetails}
        showDragHandle={false}
        collapsed={!isExpanded}
        onToggleCollapse={onToggleCollapse}
        header={renderItemHeader!(item)}
        summary={renderItemSummary?.(item)}
        actions={renderItemActions?.(item)}
        body={details}
      />
    </>
  )
}

export function CatalogPickerSheetResults<TItem>({
  items,
  getItemKey,
  rowProps,
  resultsLabel,
}: {
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  rowProps: CatalogPickerSheetProps<TItem>
  resultsLabel?: string
}) {
  const rows = items.map((item) => {
    const itemKey = getItemKey(item)

    return (
      <div key={itemKey} data-picker-item-key={itemKey}>
        <CatalogPickerCollapsibleItemRow
          item={item}
          itemKey={itemKey}
          toolbarLabel={rowProps.getItemToolbarLabel?.(item) ?? itemKey}
          renderItemHeader={rowProps.renderItemHeader}
          renderCollapsibleRow={rowProps.renderCollapsibleRow}
          renderItemSummary={rowProps.renderItemSummary}
          renderItemActions={rowProps.renderItemActions}
          renderItemDetails={rowProps.renderItemDetails}
          expandedItemId={rowProps.expandedItemId}
          onExpandedItemChange={rowProps.onExpandedItemChange}
          selection={rowProps.selection}
        />
      </div>
    )
  })

  const listClassName = catalogPickerSheetListVariants()

  if (rowProps.selection) {
    return (
      <RadioGroup
        className={listClassName}
        aria-label={resultsLabel}
        value={rowProps.selection.value ?? ''}
        onValueChange={rowProps.selection.onValueChange}
      >
        {rows}
      </RadioGroup>
    )
  }

  return (
    <div className={listClassName} role="list">
      {rows.map((row) => (
        <div key={row.key} role="listitem">
          {row}
        </div>
      ))}
    </div>
  )
}
