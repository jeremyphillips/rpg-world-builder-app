'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

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
  fieldCount: number
  showGrip: boolean
  grip?: React.ReactNode
  fields: React.ReactNode[]
  actions: React.ReactNode
  summary?: React.ReactNode
}

/**
 * Compact array item layout — `[grip?] [field₁] … [fieldₙ] [actions]` on one grid row,
 * with an optional full-width summary below.
 */
export function ArrayItemCompactRow({
  titleId,
  ariaLabel,
  fieldCount,
  showGrip,
  grip,
  fields,
  actions,
  summary,
}: ArrayItemCompactRowProps) {
  const gridStyle = {
    gridTemplateColumns: buildArrayItemCompactRowGridTemplate(fieldCount, showGrip),
  } as CSSProperties

  return (
    <div
      className={arrayItemCompactRowClasses}
      style={gridStyle}
      data-compact-field-count={fieldCount}
    >
      <span id={titleId} className="sr-only">
        {ariaLabel}
      </span>
      {showGrip && grip ? <div className={arrayItemCompactGripClasses}>{grip}</div> : null}
      {fields.map((field, index) => (
        <div key={index} className={arrayItemCompactFieldCellClasses}>
          {field}
        </div>
      ))}
      <div className={arrayItemCompactActionsClasses}>{actions}</div>
      {summary ? <div className={arrayItemCompactSummaryClasses}>{summary}</div> : null}
    </div>
  )
}
