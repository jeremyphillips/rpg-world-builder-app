import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { detailEntityRowActionsVariants } from './detail-entity-row-actions.variants'

export type DetailEntityRowActionsProps = {
  children: ReactNode
  className?: string
}

/**
 * Layout-only cluster for multiple trailing detail-row controls.
 * Owns alignment, gap, and shrink — not control density/chrome.
 * Callers must not mount this with zero meaningful children.
 */
export function DetailEntityRowActions({ children, className }: DetailEntityRowActionsProps) {
  return <div className={cn(detailEntityRowActionsVariants(), className)}>{children}</div>
}
