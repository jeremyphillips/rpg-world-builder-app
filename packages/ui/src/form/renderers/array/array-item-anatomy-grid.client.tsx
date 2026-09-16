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
  resolveArrayItemAnatomyFieldGridColumn,
  resolveArrayItemAnatomyGridChromeColumn,
  resolveArrayItemAnatomyGridPresentation,
  type ArrayItemAnatomyGridVariantProps,
} from './array-item-anatomy-grid.variants'

export interface ArrayItemAnatomyGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width tokens for field columns — same order as `children`. */
  fieldWidths: readonly FieldWidth[]
  showGrip?: boolean
  gap?: NonNullable<ArrayItemAnatomyGridVariantProps['gap']>
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
 * Phase 0 / Phase 1 compact array shell — one shared anatomy grid for fields + chrome.
 *
 * Composition model: outer grid owns tracks; field columns use subgrid; grip/actions span all
 * row tracks and vertically center within the shared anatomy grid cell.
 */
export function ArrayItemAnatomyGrid({
  fieldWidths,
  showGrip = true,
  gap = 'compact',
  grip,
  actions,
  children,
  className,
  style,
  ...props
}: ArrayItemAnatomyGridProps) {
  const presentation = resolveArrayItemAnatomyGridPresentation(fieldWidths, { showGrip, gap })
  const fieldChildren = React.Children.toArray(children)
  const fieldCount = fieldChildren.length

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
            gridColumn={resolveArrayItemAnatomyGridChromeColumn({
              role: 'grip',
              fieldCount,
              showGrip,
            })}
          >
            {grip}
          </ArrayItemAnatomyChromeColumn>
        ) : null}
        {fieldChildren.map((child, index) => wrapFieldGridPlacement(child, index, showGrip))}
        <ArrayItemAnatomyChromeColumn
          slot="actions"
          gridColumn={resolveArrayItemAnatomyGridChromeColumn({
            role: 'actions',
            fieldCount,
            showGrip,
          })}
        >
          {actions}
        </ArrayItemAnatomyChromeColumn>
      </div>
    </FieldRowAnatomyProvider>
  )
}
