'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../../context/array-item-presentation.context'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { RowConfig, RowFieldItem } from '../../field-config'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
import { ArrayItemShell } from './array-item-shell.client'
import { ArrayItemAnatomyInlineRow } from './array-item-anatomy-inline-row.client'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import { ArrayItemDragHandleSlot } from './array-item-drag-handle-slot.client'

export interface FlatNoHeaderArrayFieldItemProps {
  titleId: string
  itemPrefix: string
  reserveDragHandleSlot: boolean
  collapsible: boolean
  dragging?: boolean
  shellClassName?: string
  idPrefix: string
  contentLayout: 'inline' | 'stacked'
  inlineFields?: RowFieldItem[]
  inlineRow?: RowConfig
  header: ResolvedArrayItemHeader
  sortableEnabled: boolean
  suppressFieldErrorText: boolean
  rowSummaryId: string
  arrayContext: React.ComponentProps<typeof ArrayFieldContext.Provider>['value']
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
  issueSummary?: ArrayItemIssueSummaryProps
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
}

function FlatNoHeaderStackedContent({
  fieldsNode,
  issueSummary,
}: {
  fieldsNode: React.ReactNode
  issueSummary?: ArrayItemIssueSummaryProps
}) {
  return (
    <>
      {fieldsNode}
      {issueSummary?.placement === 'compactSummary' ? (
        <ArrayItemIssueSummary {...issueSummary} />
      ) : null}
    </>
  )
}

export function FlatNoHeaderArrayFieldItem({
  titleId,
  itemPrefix,
  reserveDragHandleSlot,
  collapsible,
  dragging,
  shellClassName,
  idPrefix,
  itemPrefix: namePrefix,
  contentLayout,
  inlineFields,
  inlineRow,
  header,
  sortableEnabled,
  suppressFieldErrorText,
  rowSummaryId,
  arrayContext,
  dragHandleProps,
  issueSummary,
  fieldsNode,
  actionsRail,
}: FlatNoHeaderArrayFieldItemProps) {
  const rowPresentation = React.useContext(ArrayItemPresentationContext)
  const suppressRowFieldErrorText = resolveErrorPlacement(
    inlineRow?.errorPlacement,
    'compact',
    true,
  )
  const rowPresentationValue = suppressRowFieldErrorText
    ? { ...rowPresentation, suppressFieldErrorText: true }
    : rowPresentation

  const grip = (
    <ArrayItemDragHandleSlot
      reserveSlot={reserveDragHandleSlot}
      sortableEnabled={sortableEnabled}
      ariaLabel={`Drag to reorder ${header.ariaLabel}`}
      attributes={dragHandleProps?.attributes}
      listeners={dragHandleProps?.listeners}
      compact
    />
  )

  const inlineSummary =
    contentLayout === 'inline' && issueSummary?.placement === 'compactSummary' ? (
      <ArrayItemIssueSummary {...issueSummary} />
    ) : undefined

  const inlineMain =
    contentLayout === 'inline' && inlineFields ? (
      <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
        <ArrayFieldContext.Provider value={arrayContext}>
          <ArrayItemAnatomyInlineRow
            titleId={titleId}
            ariaLabel={header.ariaLabel}
            showGrip={reserveDragHandleSlot}
            inlineFields={inlineFields}
            inlineRow={inlineRow}
            idPrefix={idPrefix}
            namePrefix={namePrefix}
            rowPresentationValue={rowPresentationValue}
            grip={grip}
            actions={actionsRail}
            summary={inlineSummary}
          />
        </ArrayFieldContext.Provider>
      </ArrayItemPresentationContext.Provider>
    ) : null

  const stackedMain = (
    <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
      <ArrayFieldContext.Provider value={arrayContext}>
        <ArrayItemCompactRow
          titleId={titleId}
          ariaLabel={header.ariaLabel}
          showGrip={reserveDragHandleSlot}
          grip={grip}
          fields={
            <div
              className="min-w-0"
              data-array-item-flat-no-header=""
              data-array-item-content-layout={contentLayout}
            >
              <FlatNoHeaderStackedContent fieldsNode={fieldsNode} issueSummary={issueSummary} />
            </div>
          }
          actions={actionsRail}
        />
      </ArrayFieldContext.Provider>
    </ArrayItemPresentationContext.Provider>
  )

  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={reserveDragHandleSlot}
      collapsible={collapsible}
      dragging={dragging}
      layout="compactRow"
      className={shellClassName}
      main={inlineMain ?? stackedMain}
    />
  )
}
