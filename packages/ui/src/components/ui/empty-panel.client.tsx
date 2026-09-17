'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { emptyPanelVariants } from './empty-panel.variants'

export type EmptyPanelProps = {
  children: ReactNode
  className?: string
}

/** Muted empty-state panel — presentation only; callers own copy and semantics. */
export function EmptyPanel({ children, className }: EmptyPanelProps) {
  return (
    <div role="status" className={cn(emptyPanelVariants(), className)}>
      {children}
    </div>
  )
}
