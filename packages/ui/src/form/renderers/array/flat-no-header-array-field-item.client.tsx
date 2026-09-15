'use client'

import * as React from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import { ArrayFieldContext } from '../../context/array-field.context'
import {
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../../context/array-item-presentation.context'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayItemConfig, RowConfig, RowFieldItem } from '../../field-config'
import { isRowSlotItem } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
import { FieldNode } from '../../containers/form-conditional.client'
import { SlotFormItemSection } from '../fields/slot-field-renderer.client'
import { FieldRow } from '../../../components/ui/field-row'
import { ArrayItemCompactRow } from './array-item-compact-row.client'
import { ArrayItemDragHandleSlot } from './array-item-drag-handle-slot.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'
import { ArrayItemShell } from './array-item-shell.client'
import { resolveArrayItemCompactInlineAlign } from './array-item-toolbar.variants'

interface FlatNoHeaderInlineFieldsProps {
  inlineFields: RowFieldItem[]
  inlineRow?: RowConfig
  idPrefix: string
  namePrefix: string
  rowPresentationValue: React.ComponentProps<typeof ArrayItemPresentationContext.Provider>['value']
}

function FlatNoHeaderInlineFields({
  inlineFields,
  inlineRow,
  idPrefix,
  namePrefix,
  rowPresentationValue,
}: FlatNoHeaderInlineFieldsProps) {
  const parentContext = useFormSectionContext()

  return (
    <ArrayItemPresentationContext.Provider value={rowPresentationValue}>
      <FieldRow className={inlineRow?.className}>
        {inlineFields.map((field) =>
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
  )
}

interface FlatNoHeaderContentProps {
  contentLayout: 'inline' | 'stacked'
  inlineFieldsNode: React.ReactNode
  fieldsNode: React.ReactNode
  issueSummary?: ArrayItemIssueSummaryProps
}

function FlatNoHeaderContent({
  contentLayout,
  inlineFieldsNode,
  fieldsNode,
  issueSummary,
}: FlatNoHeaderContentProps) {
  if (contentLayout === 'inline') return inlineFieldsNode

  return (
    <>
      {fieldsNode}
      {issueSummary?.placement === 'compactSummary' ? (
        <ArrayItemIssueSummary {...issueSummary} />
      ) : null}
    </>
  )
}

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
  compactInlineAlign?: ArrayItemConfig['inlineAlign']
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
  compactInlineAlign,
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
  const align =
    contentLayout === 'inline'
      ? resolveArrayItemCompactInlineAlign(compactInlineAlign, true)
      : 'start'

  const inlineFieldsNode =
    contentLayout === 'inline' && inlineFields ? (
      <FlatNoHeaderInlineFields
        inlineFields={inlineFields}
        inlineRow={inlineRow}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        rowPresentationValue={rowPresentationValue}
      />
    ) : null

  const contentNode = (
    <FlatNoHeaderContent
      contentLayout={contentLayout}
      inlineFieldsNode={inlineFieldsNode}
      fieldsNode={fieldsNode}
      issueSummary={issueSummary}
    />
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
      main={
        <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
          <ArrayFieldContext.Provider value={arrayContext}>
            <ArrayItemCompactRow
              titleId={titleId}
              ariaLabel={header.ariaLabel}
              showGrip={reserveDragHandleSlot}
              align={align}
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
                <div
                  className="min-w-0"
                  data-array-item-flat-no-header=""
                  data-array-item-content-layout={contentLayout}
                >
                  {contentNode}
                </div>
              }
              actions={actionsRail}
              summary={
                contentLayout === 'inline' && issueSummary?.placement === 'compactSummary' ? (
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
