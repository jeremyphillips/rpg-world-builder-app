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
  showGrip: boolean
  grip?: React.ReactNode
  /** Field row region — typically a `FieldRow` so `width` tokens compose like schema rows. */
  fields: React.ReactNode
  actions: React.ReactNode
  summary?: React.ReactNode
}

/**
 * Compact array item layout for **stacked** flat-no-header content — `[grip?] [fields] [actions]`
 * on one outer grid row, with an optional full-width summary below.
 *
 * Inline compact rows (`contentLayout: 'inline'`) use {@link ArrayItemAnatomyInlineRow} instead —
 * one shared label / control / message track grid with subgrid field participants and
 * vertically centered grip/actions.
 */
export function ArrayItemCompactRow({
  titleId,
  ariaLabel,
  showGrip,
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
      className={arrayItemCompactRowClasses()}
      style={gridStyle}
      data-compact-inline-row=""
      data-compact-stacked-row=""
    >
      <span id={titleId} className="sr-only">
        {ariaLabel}
      </span>
      {showGrip ? <div className={arrayItemCompactGripClasses()}>{grip}</div> : null}
      <div className={arrayItemCompactFieldCellClasses()}>{fields}</div>
      <div className={arrayItemCompactActionsClasses()}>{actions}</div>
      {summary ? <div className={arrayItemCompactSummaryClasses}>{summary}</div> : null}
    </div>
  )
}
