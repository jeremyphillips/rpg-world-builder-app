'use client'

import type { CSSProperties, ReactNode } from 'react'

import { cn } from '../../../lib/utils'

import { arrayItemAnatomyChromeColumnClasses } from './array-item-anatomy-grid.variants'

export interface ArrayItemAnatomyChromeColumnProps {
  slot: 'grip' | 'actions'
  gridColumn: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * Grip/actions column on the shared anatomy grid.
 *
 * Spans all three row tracks and vertically centers chrome within the cell — the
 * Phase 0 prototype expectation for compact array inline rows.
 */
export function ArrayItemAnatomyChromeColumn({
  slot,
  gridColumn,
  className,
  style,
  children,
}: ArrayItemAnatomyChromeColumnProps) {
  const slotProps =
    slot === 'grip'
      ? ({ 'data-array-item-anatomy-grip': '' } as const)
      : ({ 'data-array-item-anatomy-actions': '' } as const)

  return (
    <div
      {...slotProps}
      className={cn(arrayItemAnatomyChromeColumnClasses, className)}
      style={{
        ...style,
        gridColumn,
        gridRow: '1 / -1',
      }}
    >
      {children}
    </div>
  )
}
