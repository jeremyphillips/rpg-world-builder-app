'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import { cn } from '../../../lib/utils'

export interface ArrayItemInlineRowProps {
  showLeading?: boolean
  leading?: React.ReactNode
  content: React.ReactNode
  controls?: React.ReactNode
  actions?: React.ReactNode
  summary?: React.ReactNode
  className?: string
}

function buildGridTemplate(showLeading: boolean, hasControls: boolean): string {
  const leading = showLeading ? 'auto ' : ''
  const controls = hasControls ? ' max-content' : ''
  return `${leading}minmax(0, 1fr)${controls} max-content`
}

/**
 * Single-line array row grid — optional leading chrome, flexible content, optional
 * inline controls, and trailing actions.
 */
export function ArrayItemInlineRow({
  showLeading = false,
  leading,
  content,
  controls,
  actions,
  summary,
  className,
}: ArrayItemInlineRowProps) {
  const gridStyle = {
    gridTemplateColumns: buildGridTemplate(showLeading, Boolean(controls)),
  } as CSSProperties

  return (
    <div className={cn('grid w-full min-w-0 items-center gap-x-2', className)} style={gridStyle}>
      {showLeading && leading ? <div className="flex justify-center">{leading}</div> : null}
      <div className="min-w-0">{content}</div>
      {controls ? <div className="w-max shrink-0 justify-self-end">{controls}</div> : null}
      {actions ? (
        <div className="w-max min-w-[calc(var(--spacing)*14)] shrink-0 justify-self-end">
          {actions}
        </div>
      ) : null}
      {summary ? <div className="col-span-full min-w-0">{summary}</div> : null}
    </div>
  )
}
