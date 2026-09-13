import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { narrowPageBaseClasses } from './narrow-page.variants'
import {
  pageShellInsetClasses,
  pageSpacingClasses,
  type PageRhythm,
  type PageShellInset,
} from './page-spacing.variants'

export interface NarrowPageProps {
  children: ReactNode
  /** Vertical shell inset below the breadcrumb rail. Default: page (`py-8`). */
  spacing?: PageShellInset
  /** Vertical rhythm between direct children. Default: compact (`space-y-2`). */
  rhythm?: PageRhythm
  className?: string
}

/** Centered max-w-4xl page column for settings, forms, and simple routes. */
export function NarrowPage({
  children,
  spacing = 'page',
  rhythm = 'compact',
  className,
}: NarrowPageProps) {
  return (
    <div
      className={cn(
        narrowPageBaseClasses,
        pageShellInsetClasses[spacing],
        pageSpacingClasses[rhythm],
        className,
      )}
    >
      {children}
    </div>
  )
}
