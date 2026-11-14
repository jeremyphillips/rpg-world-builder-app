import type * as React from 'react'

import type { SemanticSurfaceTone } from '../../../components/ui/field-surface.variants'
import type { ResolvedArrayItemHeader } from '../../config/array/array-item-config.lib'
import type { ArrayItemConfig } from '../../field-config'
import type { NormalizedArrayItemContent } from '../../config/array/array-item-content-normalizer.lib'
import type {
  DetailedArrayFieldItemProps,
  FlatLabeledArrayFieldItemProps,
} from './array-field-item-content-anatomy.client'
import type { ArrayFieldItemContentProps } from './array-field-item-content.client'
import type { FlatNoHeaderArrayFieldItemProps } from './flat-no-header-array-field-item.client'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import type { ArrayItemResolvedPresentation } from '../../config/array/array-item-presentation.lib'
import type { ArrayFieldContextValue } from '../../context/array-field.context'

export function buildArrayFieldItemAnatomyProps(options: {
  idPrefix: string
  itemPrefix: string
  index: number
  itemId: string
  chromeProps: {
    titleId: string
    itemPrefix: string
    reserveDragHandleSlot: boolean
    gripVisible: boolean
    collapsible: boolean
    dragging?: boolean
    shellClassName?: string
  }
  presentation: ArrayItemResolvedPresentation
  normalizedContent?: NormalizedArrayItemContent
  header: ResolvedArrayItemHeader
  headerConfig: ArrayItemConfig['header']
  itemValues: Record<string, unknown>
  watchedSummaryContext?: Record<string, unknown>
  sortableEnabled: boolean
  dragHandleProps: ArrayFieldItemContentProps['dragHandleProps']
  issueSummaries: readonly ArrayItemIssueSummaryProps[]
  shellTone: SemanticSurfaceTone | undefined
  itemBody: React.ReactNode | undefined
  fieldsNode: React.ReactNode
  actionsRail: React.ReactNode
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  leadingChrome: { reserveDragHandleSlot: boolean; showDragHandle: boolean; collapsible: boolean }
  suppressFieldErrorText: boolean
  rowSummaryId: string
  arrayContext: ArrayFieldContextValue
}): {
  flatNoHeader: FlatNoHeaderArrayFieldItemProps
  flatWithHeader: FlatLabeledArrayFieldItemProps
  disclosure: DetailedArrayFieldItemProps
} {
  const {
    idPrefix,
    itemPrefix,
    index,
    itemId,
    chromeProps,
    presentation,
    normalizedContent,
    header,
    headerConfig,
    itemValues,
    watchedSummaryContext,
    sortableEnabled,
    dragHandleProps,
    issueSummaries,
    shellTone,
    itemBody,
    fieldsNode,
    actionsRail,
    collapsed,
    onToggleCollapse,
    bodyId,
    leadingChrome,
    suppressFieldErrorText,
    rowSummaryId,
    arrayContext,
  } = options

  return {
    flatNoHeader: {
      ...chromeProps,
      idPrefix,
      itemPrefix,
      contentLayout: presentation.contentLayout,
      inlineFields: normalizedContent?.inlineFields,
      inlineRow: normalizedContent?.inlineRow,
      header,
      sortableEnabled,
      suppressFieldErrorText,
      rowSummaryId,
      arrayContext,
      dragHandleProps,
      issueSummaries,
      shellTone,
      fieldsNode,
      actionsRail,
    },
    flatWithHeader: {
      ...chromeProps,
      itemId,
      header,
      headerConfig,
      itemValues,
      index,
      watchedSummaryContext,
      sortableEnabled,
      dragHandleProps,
      issueSummaries,
      shellTone,
      itemBody,
      actionsRail,
    },
    disclosure: {
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
      issueSummaries,
      shellTone,
      itemBody,
      leadingChrome,
      actionsRail,
    },
  }
}
