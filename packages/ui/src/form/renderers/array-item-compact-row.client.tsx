'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import type { ArrayCompactInlineAlign } from '../field-config'
import {
  arrayItemCompactActionsClasses,
  arrayItemCompactFieldCellClasses,
  arrayItemCompactGripClasses,
  arrayItemCompactRowClasses,
  arrayItemCompactSummaryClasses,
  buildArrayItemCompactRowGridTemplate,
} from './array-item-toolbar.variants'

export interface ArrayItemCompactRowProps {
  titleId: string
  ariaLabel: string
  showGrip: boolean
  align?: ArrayCompactInlineAlign
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
  align = 'start',
  grip,
  fields,
  actions,
  summary,
}: ArrayItemCompactRowProps) {
  const gridStyle = {
    gridTemplateColumns: buildArrayItemCompactRowGridTemplate(showGrip),
  } as CSSProperties

  return (
    <div
      className={arrayItemCompactRowClasses(align)}
      style={gridStyle}
      data-compact-inline-row=""
      data-compact-inline-align={align}
    >
      <span id={titleId} className="sr-only">
        {ariaLabel}
      </span>
      {showGrip && grip ? <div className={arrayItemCompactGripClasses(align)}>{grip}</div> : null}
      <div className={arrayItemCompactFieldCellClasses}>{fields}</div>
      <div className={arrayItemCompactActionsClasses}>{actions}</div>
      {summary ? <div className={arrayItemCompactSummaryClasses}>{summary}</div> : null}
    </div>
  )
}
