'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../context/array-field.context'
import { ArrayItemPresentationContext } from '../context/array-item-presentation.context'
import {
  resolveArrayItemHeader,
  type ResolvedArrayItemHeader,
} from '../config/array-item-config.lib'
import type { ArrayConfig, RowConfig } from '../field-config'
import { NestedFormItems } from '../containers/form-item-node.client'
import { FieldNode } from '../containers/form-conditional.client'
import { resolveIssueProminence } from '../errors/resolve-issue-prominence'
import { ArrayItemToolbar, ArrayItemDragHandle } from './array-item-header.client'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import { ArrayItemActionsRail, ArrayItemShell } from './array-item-shell.client'
import { arrayItemBodyClasses } from './array-item-toolbar.variants'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
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
  gripVisible: boolean
  collapsible: boolean
  dragging?: boolean
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
  badgeProminence: ReturnType<typeof resolveIssueProminence>
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
}: ArrayFieldItemActionsRailProps) {
  return (
    <ArrayItemActionsRail
      removeAriaLabel={`Remove ${header.ariaLabel}`}
      canRemove={canRemove}
      showDefaultRemove={showDefaultItemRemove}
      customRemove={customRemove}
      onRemove={onRemove}
      issueCount={showIssueChrome ? issueCount : 0}
      issueRowLabel={rowLabel}
      onIssuePress={onFocusIssue}
      badgeProminence={showIssueChrome ? badgeProminence : 'nav'}
      compact={variant === 'compact'}
      embedded={embedded}
    />
  )
}

interface CompactInlineArrayFieldItemProps extends ArrayFieldItemChromeProps {
  idPrefix: string
  itemPrefix: string
  compactInlineRow: RowConfig
  compactInlineAlign?: ArrayConfig['compactInlineAlign']
  header: ResolvedArrayItemHeader
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
  gripVisible,
  collapsible,
  dragging,
  idPrefix,
  itemPrefix: namePrefix,
  compactInlineRow,
  compactInlineAlign,
  header,
  suppressFieldErrorText,
  rowSummaryId,
  arrayContext,
  dragHandleProps,
  actionsRail,
  issueSummary,
}: CompactInlineArrayFieldItemProps) {
  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
      dragging={dragging}
      layout="compactRow"
      main={
        <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
          <ArrayFieldContext.Provider value={arrayContext}>
            <ArrayItemCompactRow
              titleId={titleId}
              ariaLabel={header.ariaLabel}
              fieldCount={compactInlineRow.fields.length}
              showGrip={gripVisible}
              align={compactInlineAlign}
              grip={
                gripVisible && dragHandleProps ? (
                  <ArrayItemDragHandle
                    ariaLabel={`Drag to reorder ${header.ariaLabel}`}
                    attributes={dragHandleProps.attributes}
                    listeners={dragHandleProps.listeners}
                    compact
                  />
                ) : undefined
              }
              fields={compactInlineRow.fields.map((field) => (
                <FieldNode
                  key={field.name}
                  config={field}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                />
              ))}
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

interface ToolbarArrayFieldItemProps extends ArrayFieldItemChromeProps {
  legend: string
  index: number
  headerConfig: ReturnType<typeof resolveArrayItemHeader>
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  showDragHandle: boolean
  dragHandleProps?: ArrayFieldItemContentProps['dragHandleProps']
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  variant: 'compact' | 'detailed'
  issueSummary?: ArrayItemIssueSummaryProps
  watchedSummaryContext?: Record<string, unknown>
  fieldsNode: React.ReactNode
  leadingChrome: { showDragHandle: boolean; collapsible: boolean }
  actionsRail: React.ReactNode
}

function ToolbarArrayFieldItem({
  titleId,
  itemPrefix,
  gripVisible,
  collapsible,
  dragging,
  legend,
  index,
  headerConfig,
  itemValues,
  watchedPrimary,
  showDragHandle,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  bodyId,
  variant,
  issueSummary,
  watchedSummaryContext,
  fieldsNode,
  leadingChrome,
  actionsRail,
}: ToolbarArrayFieldItemProps) {
  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
      dragging={dragging}
      main={
        <>
          <ArrayItemToolbar
            legend={legend}
            index={index}
            headerConfig={headerConfig}
            itemValues={itemValues}
            watchedPrimary={watchedPrimary}
            watchedSummaryContext={watchedSummaryContext}
            showDragHandle={showDragHandle}
            dragHandleProps={
              dragHandleProps
                ? {
                    ariaLabel: '',
                    attributes: dragHandleProps.attributes,
                    listeners: dragHandleProps.listeners,
                  }
                : undefined
            }
            collapsible={collapsible}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            bodyId={bodyId}
            titleId={titleId}
            compact={variant === 'compact'}
            issueSummary={issueSummary}
          >
            {variant === 'compact' ? fieldsNode : null}
          </ArrayItemToolbar>
          {variant === 'detailed' ? (
            <div
              id={bodyId}
              hidden={collapsed || undefined}
              className={arrayItemBodyClasses(leadingChrome)}
              aria-hidden={collapsed}
            >
              {fieldsNode}
            </div>
          ) : null}
        </>
      }
      actions={actionsRail}
    />
  )
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
  showDragHandle,
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
    watchedPrimary,
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
  } = useArrayFieldItemContentState({
    config,
    idPrefix,
    fullName,
    index,
    itemId,
    legend,
    variant,
    collapsed,
    showDragHandle,
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

  const customRemove = config.itemRemoveSlot ? (
    <ArrayFieldContext.Provider value={arrayContext}>
      {config.itemRemoveSlot.render()}
    </ArrayFieldContext.Provider>
  ) : undefined

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
      embedded={Boolean(compactInlineRow)}
    />
  )

  if (compactInlineRow) {
    return (
      <CompactInlineArrayFieldItem
        {...chromeProps}
        idPrefix={idPrefix}
        itemPrefix={itemPrefix}
        compactInlineRow={compactInlineRow}
        compactInlineAlign={config.compactInlineAlign}
        header={header}
        suppressFieldErrorText={suppressFieldErrorText}
        rowSummaryId={rowSummaryId}
        arrayContext={arrayContext}
        dragHandleProps={dragHandleProps}
        actionsRail={actionsRail}
        issueSummary={issueSummary}
      />
    )
  }

  return (
    <ToolbarArrayFieldItem
      {...chromeProps}
      legend={legend}
      index={index}
      headerConfig={headerConfig}
      itemValues={itemValues}
      watchedPrimary={watchedPrimary}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      bodyId={bodyId}
      variant={variant}
      issueSummary={issueSummary}
      watchedSummaryContext={watchedSummaryContext}
      fieldsNode={fieldsNode}
      leadingChrome={leadingChrome}
      actionsRail={actionsRail}
    />
  )
}
