'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../../context/array-item-presentation.context'
import type { ArrayItemPresentationAnatomy } from '../../config/array/array-item-presentation.lib'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayConfig, ArrayItemConfig, RowConfig } from '../../field-config'
import { isRowSlotItem } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { NestedFormItems } from '../../containers/form-item-node.client'
import { FieldNode } from '../../containers/form-conditional.client'
import { SlotFormItemSection } from '../fields/slot-field-renderer.client'
import type { ArrayItemIssueProminence } from './array-item-issue.variants'
import { CollapsibleListItem } from '../../../components/ui/collapsible-list-item'
import { resolveArrayItemShellSurface } from '../../config/array/resolve-array-item-shell-surface.lib'
import { FieldRow } from '../../../components/ui/field-row'
import { ArrayItemHeaderContent, ArrayItemHeaderSummary } from './array-item-header.client'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import { ArrayItemDragHandleSlot } from './array-item-drag-handle-slot.client'
import {
  ArrayItemActionsContent,
  ArrayItemActionsRail,
  ArrayItemShell,
} from './array-item-shell.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
import {
  arrayItemUnlabeledStackedGridTemplate,
  arrayItemUnlabeledStackedRowClasses,
  resolveArrayItemCompactInlineAlign,
} from './array-item-toolbar.variants'
import { useArrayFieldItemContentState } from './use-array-field-item-content-state.client'

export interface ArrayFieldItemContentProps {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  itemBodyStackClasses: string
  canRemove: boolean
  showDefaultItemRemove: boolean
  showDragHandle: boolean
  fieldsLength: number
  collapsible: boolean
  variant: 'compact' | 'detailed'
  collapsed: boolean
  onToggleCollapse: () => void
  onRemove: () => void
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
}

interface ArrayFieldItemChromeProps {
  titleId: string
  itemPrefix: string
  reserveDragHandleSlot: boolean
  gripVisible: boolean
  collapsible: boolean
  dragging?: boolean
  shellClassName?: string
}

interface ArrayFieldItemActionsRailProps {
  header: ResolvedArrayItemHeader
  canRemove: boolean
  showDefaultItemRemove: boolean
  customRemove?: React.ReactNode
  onRemove: () => void
  showIssueChrome: boolean
  issueCount: number
  rowLabel: string
  onFocusIssue: () => void
  badgeProminence: ArrayItemIssueProminence
  variant: 'compact' | 'detailed'
  embedded: boolean
}

function ArrayFieldItemActionsRailSlot({
  header,
  canRemove,
  showDefaultItemRemove,
  customRemove,
  onRemove,
  showIssueChrome,
  issueCount,
  rowLabel,
  onFocusIssue,
  badgeProminence,
  variant,
  embedded,
  bare = false,
}: ArrayFieldItemActionsRailProps & { bare?: boolean }) {
  const contentProps = {
    removeAriaLabel: `Remove ${header.ariaLabel}`,
    canRemove,
    showDefaultRemove: showDefaultItemRemove,
    customRemove,
    onRemove,
    issueCount: showIssueChrome ? issueCount : 0,
    issueRowLabel: rowLabel,
    onIssuePress: onFocusIssue,
    badgeProminence: showIssueChrome ? badgeProminence : 'nav',
    compact: variant === 'compact',
  }

  if (bare) {
    return <ArrayItemActionsContent {...contentProps} />
  }

  return <ArrayItemActionsRail {...contentProps} embedded={embedded} />
}

interface CompactInlineArrayFieldItemProps extends ArrayFieldItemChromeProps {
  idPrefix: string
  itemPrefix: string
  compactInlineRow: RowConfig
  compactInlineAlign?: ArrayItemConfig['inlineAlign']
  header: ResolvedArrayItemHeader
  sortableEnabled: boolean
  suppressFieldErrorText: boolean
  rowSummaryId: string
  arrayContext: React.ComponentProps<typeof ArrayFieldContext.Provider>['value']
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  actionsRail: React.ReactNode
  issueSummary?: ArrayItemIssueSummaryProps
}

function CompactInlineArrayFieldItem({
  titleId,
  itemPrefix,
  reserveDragHandleSlot,
  collapsible,
  dragging,
  shellClassName,
  idPrefix,
  itemPrefix: namePrefix,
  compactInlineRow,
  compactInlineAlign,
  header,
  sortableEnabled,
  suppressFieldErrorText,
  rowSummaryId,
  arrayContext,
  dragHandleProps,
  actionsRail,
  issueSummary,
}: CompactInlineArrayFieldItemProps) {
  const parentContext = useFormSectionContext()
  const rowPresentation = React.useContext(ArrayItemPresentationContext)
  const suppressRowFieldErrorText = resolveErrorPlacement(
    compactInlineRow.errorPlacement,
    'compact',
    true,
  )
  const rowPresentationValue = suppressRowFieldErrorText
    ? { ...rowPresentation, suppressFieldErrorText: true }
    : rowPresentation

  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={reserveDragHandleSlot}
      collapsible={collapsible}
      dragging={dragging}
      layout="compactRow"
      className={shellClassName}
      main={
        <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
          <ArrayFieldContext.Provider value={arrayContext}>
            <ArrayItemCompactRow
              titleId={titleId}
              ariaLabel={header.ariaLabel}
              showGrip={reserveDragHandleSlot}
              align={compactInlineAlign}
              unlabeled
              grip={
                <ArrayItemDragHandleSlot
                  reserveSlot={reserveDragHandleSlot}
                  sortableEnabled={sortableEnabled}
                  ariaLabel={`Drag to reorder ${header.ariaLabel}`}
                  attributes={dragHandleProps?.attributes}
                  listeners={dragHandleProps?.listeners}
                  compact
                />
              }
              fields={
                <ArrayItemPresentationContext.Provider value={rowPresentationValue}>
                  <FieldRow className={compactInlineRow.className}>
                    {compactInlineRow.fields.map((field) =>
                      isRowSlotItem(field) ? (
                        <SlotFormItemSection
                          key={field.name}
                          item={field}
                          parentContext={parentContext}
                          depth={1}
                          namePrefix={namePrefix}
                        />
                      ) : (
                        <FieldNode
                          key={field.name}
                          config={field}
                          idPrefix={idPrefix}
                          namePrefix={namePrefix}
                        />
                      ),
                    )}
                  </FieldRow>
                </ArrayItemPresentationContext.Provider>
              }
              actions={actionsRail}
              summary={
                issueSummary?.placement === 'compactSummary' ? (
                  <ArrayItemIssueSummary {...issueSummary} />
                ) : undefined
              }
            />
          </ArrayFieldContext.Provider>
        </ArrayItemPresentationContext.Provider>
      }
    />
  )
}

interface UnlabeledStackedArrayFieldItemProps extends ArrayFieldItemChromeProps {
  header: ResolvedArrayItemHeader
  sortableEnabled: boolean
  compactInlineAlign?: ArrayItemConfig['inlineAlign']
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
}

function UnlabeledStackedArrayFieldItem({
  titleId,
  itemPrefix,
  reserveDragHandleSlot,
  collapsible,
  dragging,
  shellClassName,
  header,
  sortableEnabled,
  compactInlineAlign,
  dragHandleProps,
  issueSummary,
  fieldsNode,
  actionsRail,
}: UnlabeledStackedArrayFieldItemProps) {
  const gridStyle = {
    gridTemplateColumns: arrayItemUnlabeledStackedGridTemplate(reserveDragHandleSlot),
  } as CSSProperties

  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={false}
      collapsible={collapsible}
      dragging={dragging}
      className={shellClassName}
      main={
        <div
          className={arrayItemUnlabeledStackedRowClasses(compactInlineAlign)}
          style={gridStyle}
          data-array-item-unlabeled-stacked=""
        >
          <span id={titleId} className="sr-only">
            {header.ariaLabel}
          </span>
          {reserveDragHandleSlot ? (
            <div className="flex justify-center self-start">
              <ArrayItemDragHandleSlot
                reserveSlot={reserveDragHandleSlot}
                sortableEnabled={sortableEnabled}
                ariaLabel={`Drag to reorder ${header.ariaLabel}`}
                attributes={dragHandleProps?.attributes}
                listeners={dragHandleProps?.listeners}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            {fieldsNode}
            {issueSummary?.placement === 'compactSummary' ? (
              <ArrayItemIssueSummary {...issueSummary} />
            ) : null}
          </div>
        </div>
      }
      actions={actionsRail}
    />
  )
}

interface FlatLabeledArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
}

function FlatLabeledArrayFieldItem({
  titleId,
  itemPrefix,
  itemId,
  reserveDragHandleSlot,
  dragging,
  shellClassName,
  header,
  headerConfig,
  itemValues,
  index,
  watchedSummaryContext,
  sortableEnabled,
  dragHandleProps,
  issueSummary,
  fieldsNode,
  actionsRail,
}: FlatLabeledArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummary ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummary={issueSummary}
        collapsed={false}
        leadingChrome={{
          reserveDragHandleSlot,
          showDragHandle: reserveDragHandleSlot,
          collapsible: false,
        }}
      />
    ) : undefined

  return (
    <CollapsibleListItem
      itemId={itemId}
      titleId={titleId}
      itemPrefix={itemPrefix}
      toolbarAriaLabel={header.ariaLabel}
      collapsible={false}
      collapsed={false}
      showDragHandle={reserveDragHandleSlot}
      dragHandleProps={
        sortableEnabled && dragHandleProps
          ? {
              attributes: dragHandleProps.attributes,
              listeners: dragHandleProps.listeners,
              isDragging: dragHandleProps.isDragging,
            }
          : undefined
      }
      dragging={dragging}
      surface={resolveArrayItemShellSurface({
        explicit: arrayItemSurface,
        collapsible: false,
      })}
      tone={arrayItemTone}
      actionsAlign="center"
      className={shellClassName}
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={fieldsNode}
      actions={actionsRail}
    />
  )
}

interface DetailedArrayFieldItemProps extends ArrayFieldItemChromeProps {
  itemId: string
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  index: number
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  leadingChrome: { reserveDragHandleSlot: boolean; showDragHandle: boolean; collapsible: boolean }
  actionsRail: React.ReactNode
}

function DetailedArrayFieldItem({
  titleId,
  itemPrefix,
  itemId,
  reserveDragHandleSlot,
  collapsible,
  dragging,
  header,
  headerConfig,
  itemValues,
  index,
  watchedSummaryContext,
  sortableEnabled,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  bodyId,
  issueSummary,
  fieldsNode,
  leadingChrome,
  actionsRail,
}: DetailedArrayFieldItemProps) {
  const { arrayItemSurface, arrayItemTone } = useFormSectionContext()
  const summary = headerConfig?.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
  const summaryNode =
    summary || issueSummary ? (
      <ArrayItemHeaderSummary
        summary={summary}
        issueSummary={issueSummary}
        collapsed={collapsed}
        leadingChrome={leadingChrome}
      />
    ) : undefined

  return (
    <CollapsibleListItem
      itemId={itemId}
      titleId={titleId}
      bodyId={bodyId}
      itemPrefix={itemPrefix}
      toolbarAriaLabel={header.ariaLabel}
      collapsible={collapsible}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      showDragHandle={reserveDragHandleSlot}
      dragHandleProps={
        sortableEnabled && dragHandleProps
          ? {
              attributes: dragHandleProps.attributes,
              listeners: dragHandleProps.listeners,
              isDragging: dragHandleProps.isDragging,
            }
          : undefined
      }
      dragging={dragging}
      surface={resolveArrayItemShellSurface({
        explicit: arrayItemSurface,
        collapsible,
      })}
      tone={arrayItemTone}
      actionsAlign="center"
      header={<ArrayItemHeaderContent header={header} />}
      summary={summaryNode}
      body={fieldsNode}
      actions={actionsRail}
    />
  )
}

function renderArrayFieldItemByAnatomy(
  anatomy: ArrayItemPresentationAnatomy,
  props: {
    compactInline: CompactInlineArrayFieldItemProps | null
    unlabeledStacked: UnlabeledStackedArrayFieldItemProps
    flatLabeled: FlatLabeledArrayFieldItemProps
    detailed: DetailedArrayFieldItemProps
  },
) {
  switch (anatomy) {
    case 'lightShellInline':
      return props.compactInline ? <CompactInlineArrayFieldItem {...props.compactInline} /> : null
    case 'lightShellStacked':
      return <UnlabeledStackedArrayFieldItem {...props.unlabeledStacked} />
    case 'collapsibleListItemFlat':
      return <FlatLabeledArrayFieldItem {...props.flatLabeled} />
    case 'collapsibleListItemDisclosure':
      return <DetailedArrayFieldItem {...props.detailed} />
    default:
      return null
  }
}

export function ArrayFieldItemContent({
  config,
  idPrefix,
  fullName,
  index,
  itemId,
  legend,
  itemBodyStackClasses,
  canRemove,
  showDefaultItemRemove,
  showDragHandle: _showDragHandle,
  fieldsLength,
  collapsible,
  variant,
  collapsed,
  onToggleCollapse,
  onRemove,
  dragHandleProps,
}: ArrayFieldItemContentProps) {
  const {
    itemPrefix,
    headerConfig,
    watchedSummaryContext,
    itemValues,
    bodyId,
    arrayContext,
    rowSummaryId,
    suppressFieldErrorText,
    header,
    leadingChrome,
    rowLabel,
    focusIssue,
    badgeProminence,
    issueSummary,
    compactInlineRow,
    chromeProps,
    showIssueChrome,
    issueGroup,
    itemConfig,
    anatomy,
    sortableEnabled,
    presentation,
  } = useArrayFieldItemContentState({
    config,
    idPrefix,
    fullName,
    index,
    itemId,
    legend,
    variant,
    collapsed,
    fieldsLength,
    collapsible,
    dragHandleProps,
    onRemoveItem: onRemove,
  })

  const fieldsNode = (
    <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
      <ArrayFieldContext.Provider value={arrayContext}>
        <div className={itemBodyStackClasses}>
          <NestedFormItems
            items={config.fields}
            idPrefix={idPrefix}
            namePrefix={itemPrefix}
            depth={1}
          />
        </div>
      </ArrayFieldContext.Provider>
    </ArrayItemPresentationContext.Provider>
  )

  const customRemove = itemConfig.removeSlot ? (
    <ArrayFieldContext.Provider value={arrayContext}>
      {itemConfig.removeSlot.render()}
    </ArrayFieldContext.Provider>
  ) : undefined

  const isUnlabeled = presentation.itemLabel === 'none'
  const compactInlineAlign = resolveArrayItemCompactInlineAlign(itemConfig.inlineAlign, isUnlabeled)
  const actionsEmbedded = anatomy === 'lightShellInline' || Boolean(itemConfig.renderShell)
  const actionsRail = (
    <ArrayFieldItemActionsRailSlot
      header={header}
      canRemove={canRemove}
      showDefaultItemRemove={showDefaultItemRemove}
      customRemove={customRemove}
      onRemove={onRemove}
      showIssueChrome={showIssueChrome}
      issueCount={issueGroup.totalCount}
      rowLabel={rowLabel}
      onFocusIssue={focusIssue}
      badgeProminence={badgeProminence}
      variant={variant}
      embedded={actionsEmbedded}
      bare={
        (anatomy === 'collapsibleListItemDisclosure' || anatomy === 'collapsibleListItemFlat') &&
        !itemConfig.renderShell
      }
    />
  )

  if (itemConfig.renderShell) {
    const summary = headerConfig.summary?.(itemValues, index, watchedSummaryContext) ?? undefined
    return itemConfig.renderShell({
      itemId,
      itemPrefix,
      titleId: chromeProps.titleId,
      index,
      header,
      itemValues,
      summary: summary || undefined,
      collapsed,
      onToggleCollapse,
      dragHandleProps,
      action: actionsRail,
      children: fieldsNode,
    })
  }

  return renderArrayFieldItemByAnatomy(anatomy, {
    compactInline: compactInlineRow
      ? {
          ...chromeProps,
          idPrefix,
          itemPrefix,
          compactInlineRow,
          compactInlineAlign,
          header,
          sortableEnabled,
          suppressFieldErrorText,
          rowSummaryId,
          arrayContext,
          dragHandleProps,
          actionsRail,
          issueSummary,
        }
      : null,
    unlabeledStacked: {
      ...chromeProps,
      header,
      sortableEnabled,
      compactInlineAlign,
      dragHandleProps,
      issueSummary,
      fieldsNode,
      actionsRail,
    },
    flatLabeled: {
      ...chromeProps,
      itemId,
      header,
      headerConfig,
      itemValues,
      index,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      issueSummary,
      fieldsNode,
      actionsRail,
    },
    detailed: {
      ...chromeProps,
      itemId,
      header,
      headerConfig,
      itemValues,
      index,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      collapsed,
      onToggleCollapse,
      bodyId,
      issueSummary,
      fieldsNode,
      leadingChrome,
      actionsRail,
    },
  })
}
