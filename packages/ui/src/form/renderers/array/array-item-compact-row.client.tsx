'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import type { ArrayCompactInlineAlign } from '../../field-config'
import {
  arrayItemCompactActionsClasses,
  arrayItemCompactFieldCellClasses,
  arrayItemCompactGripClasses,
  arrayItemCompactRowClasses,
  arrayItemCompactSummaryClasses,
  buildArrayItemCompactRowGridTemplate,
  resolveArrayItemCompactInlineAlign,
} from './array-item-toolbar.variants'

export interface ArrayItemCompactRowProps {
  titleId: string
  ariaLabel: string
  showGrip: boolean
  /** When omitted, defaults to `start`. Callers should pass a resolved value for unlabeled rows. */
  align?: ArrayCompactInlineAlign
  /** When true, unlabeled rows default to center alignment when `align` is omitted. */
  unlabeled?: boolean
  grip?: React.ReactNode
  /** Field row region — typically a `FieldRow` so `width` tokens compose like schema rows. */
  fields: React.ReactNode
  actions: React.ReactNode
  summary?: React.ReactNode
}

/**
 * Compact array item layout — `[grip?] [field row] [actions]` on one grid row,
 * with an optional full-width summary below.
 */
export function ArrayItemCompactRow({
  titleId,
  ariaLabel,
  showGrip,
  align,
  unlabeled = false,
  grip,
  fields,
  actions,
  summary,
}: ArrayItemCompactRowProps) {
  const resolvedAlign = resolveArrayItemCompactInlineAlign(align, unlabeled)
  const gridStyle = {
    gridTemplateColumns: buildArrayItemCompactRowGridTemplate(showGrip),
  } as CSSProperties

  return (
    <div
      className={arrayItemCompactRowClasses(resolvedAlign)}
      style={gridStyle}
      data-compact-inline-row=""
      data-compact-inline-align={resolvedAlign}
    >
      <span id={titleId} className="sr-only">
        {ariaLabel}
      </span>
      {showGrip ? <div className={arrayItemCompactGripClasses(resolvedAlign)}>{grip}</div> : null}
      <div className={arrayItemCompactFieldCellClasses(resolvedAlign)}>{fields}</div>
      <div className={arrayItemCompactActionsClasses(resolvedAlign)}>{actions}</div>
      {summary ? <div className={arrayItemCompactSummaryClasses}>{summary}</div> : null}
    </div>
  )
}
