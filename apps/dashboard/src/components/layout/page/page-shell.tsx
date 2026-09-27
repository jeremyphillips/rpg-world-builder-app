import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { pageShellWidthClasses, type PageWidth } from './page-shell.variants'
import {
  pageShellInsetClasses,
  pageSpacingClasses,
  type PageRhythm,
  type PageShellInset,
} from './page-spacing.variants'

export type { PageWidth }

export interface PageShellProps {
  /** Route-level content width — the only page max-width owner for this subtree. */
  width: PageWidth
  children: ReactNode
  /** Vertical shell inset below the breadcrumb rail. Default: page (`pt-6 pb-8`). */
  spacing?: PageShellInset
  /** Vertical rhythm between direct children. Default: compact (`space-y-2`). */
  rhythm?: PageRhythm
  className?: string
}

/** Dashboard route width shell — full, wide (~1280px), or narrow (~900px). */
export function PageShell({
  width,
  children,
  spacing = 'page',
  rhythm = 'compact',
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        pageShellWidthClasses[width],
        pageShellInsetClasses[spacing],
        pageSpacingClasses[rhythm],
        className,
      )}
    >
      {children}
    </div>
  )
}
