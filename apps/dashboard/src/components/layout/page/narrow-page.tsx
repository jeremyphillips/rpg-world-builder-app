import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  narrowPageBaseClasses,
  narrowPageSpacingClasses,
  type NarrowPageSpacing,
} from './narrow-page.variants'

export interface NarrowPageProps {
  children: ReactNode
  /** Vertical rhythm between direct children. Default: compact (space-y-2). */
  spacing?: NarrowPageSpacing
  className?: string
}

/** Centered max-w-4xl page column for settings, forms, and simple routes. */
export function NarrowPage({ children, spacing = 'compact', className }: NarrowPageProps) {
  return (
    <div className={cn(narrowPageBaseClasses, narrowPageSpacingClasses[spacing], className)}>
      {children}
    </div>
  )
}
