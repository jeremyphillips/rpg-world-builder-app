'use client'

import * as React from 'react'

import {
  FieldAnatomyGridPlacementProvider,
  FieldRowAnatomyProvider,
} from '../../../components/ui/field-row-anatomy.context'
import { cn } from '../../../lib/utils'
import type { FieldWidth } from '../../../components/ui/field-control.variants'

import { ArrayItemAnatomyChromeColumn } from './array-item-anatomy-chrome-column.client'
import {
  buildArrayItemAnatomyFieldsClusterTemplateColumns,
  resolveArrayItemAnatomyFieldGridColumn,
  resolveArrayItemAnatomyGridPresentation,
  resolveArrayItemAnatomyParentChromeColumn,
  type ArrayFieldGap,
} from './array-item-anatomy-grid.variants'

export interface ArrayItemAnatomyGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width tokens for field columns — same order as `children`. */
  fieldWidths: readonly FieldWidth[]
  showGrip?: boolean
  /** Inter-field column gap inside the fields cluster — default `dense` (12px). */
  fieldGap?: ArrayFieldGap
  grip?: React.ReactNode
  actions: React.ReactNode
  /**
   * Field participants with `rowParticipation` — direct grid children sharing the
   * parent label / control / message tracks. Do not wrap in a nested anatomy row grid.
   * Wrapper components must forward `style` / `className` to the participating `Field.Root`.
   */
  children: React.ReactNode
}

function wrapFieldGridPlacement(
  child: React.ReactNode,
  fieldIndex: number,
  showGrip: boolean,
): React.ReactNode {
  const gridColumn = resolveArrayItemAnatomyFieldGridColumn(fieldIndex, showGrip)

  return (
    <FieldAnatomyGridPlacementProvider gridColumn={gridColumn}>
      {child}
    </FieldAnatomyGridPlacementProvider>
  )
}

/**
 * Compact array shell — shared anatomy grid with two-tier spacing (chrome gap + fields cluster).
 *
 * Composition model: outer grid owns tracks; fields cluster uses subgrid for field columns;
 * grip/actions span all row tracks and vertically center within the shared anatomy grid cell.
 */
export function ArrayItemAnatomyGrid({
  fieldWidths,
  showGrip = true,
  fieldGap = 'dense',
  grip,
  actions,
  children,
  className,
  style,
  ...props
}: ArrayItemAnatomyGridProps) {
  const presentation = resolveArrayItemAnatomyGridPresentation(fieldWidths, { showGrip, fieldGap })
  const fieldChildren = React.Children.toArray(children)

  return (
    <FieldRowAnatomyProvider>
      <div
        data-array-item-anatomy-grid=""
        className={cn(presentation.className, className)}
        style={{ ...presentation.style, ...style }}
        {...props}
      >
        {showGrip ? (
          <ArrayItemAnatomyChromeColumn
            slot="grip"
            gridColumn={resolveArrayItemAnatomyParentChromeColumn({
              role: 'grip',
              showGrip,
            })}
          >
            {grip}
          </ArrayItemAnatomyChromeColumn>
        ) : null}

        <div
          data-array-item-fields-cluster=""
          className={cn('col-span-1 grid min-w-0 grid-rows-subgrid', presentation.fieldGapClass)}
          style={{
            gridRow: '1 / -1',
            gridColumn: resolveArrayItemAnatomyParentChromeColumn({
              role: 'cluster',
              showGrip,
            }),
            gridTemplateColumns: buildArrayItemAnatomyFieldsClusterTemplateColumns(fieldWidths),
          }}
        >
          {fieldChildren.map((child, index) => wrapFieldGridPlacement(child, index, showGrip))}
        </div>

        <ArrayItemAnatomyChromeColumn
          slot="actions"
          gridColumn={resolveArrayItemAnatomyParentChromeColumn({
            role: 'actions',
            showGrip,
          })}
        >
          {actions}
        </ArrayItemAnatomyChromeColumn>
      </div>
    </FieldRowAnatomyProvider>
  )
}
