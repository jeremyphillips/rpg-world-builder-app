import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  widePageBaseClasses,
  widePageSpacingClasses,
  type WidePageSpacing,
} from './wide-page.variants'

export interface WidePageProps {
  children: ReactNode
  /** Vertical rhythm between direct children. Default: compact (space-y-2). */
  spacing?: WidePageSpacing
  className?: string
}

/** Full-width page column for lists, hubs, and detail routes. */
export function WidePage({ children, spacing = 'compact', className }: WidePageProps) {
  return (
    <div className={cn(widePageBaseClasses, widePageSpacingClasses[spacing], className)}>
      {children}
    </div>
  )
}
