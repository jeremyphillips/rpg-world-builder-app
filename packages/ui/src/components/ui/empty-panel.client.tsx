'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

export type EmptyPanelProps = {
  children: ReactNode
  className?: string
}

/**
 * Compact recessed well for a single passive empty message (muted + italic).
 * Presentation only — callers own copy. No default live-region semantics; pass
 * `role="status"` or `aria-live` on a wrapper when announcement is intentional.
 */
export function EmptyPanel({ children, className }: EmptyPanelProps) {
  return <div className={cn('ui-empty-panel', borderStrength(), className)}>{children}</div>
}
