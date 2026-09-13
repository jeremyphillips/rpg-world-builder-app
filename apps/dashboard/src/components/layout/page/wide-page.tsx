import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  pageShellInsetClasses,
  pageSpacingClasses,
  type PageRhythm,
  type PageShellInset,
} from './page-spacing.variants'
import { widePageBaseClasses } from './wide-page.variants'

export interface WidePageProps {
  children: ReactNode
  /** Vertical shell inset below the breadcrumb rail. Default: page (`py-8`); use `page-top` for viewport forms. */
  spacing?: PageShellInset
  /** Vertical rhythm between direct children. Default: compact (`space-y-2`). */
  rhythm?: PageRhythm
  className?: string
}

/** Full-width page column for lists, hubs, and detail routes. */
export function WidePage({
  children,
  spacing = 'page',
  rhythm = 'compact',
  className,
}: WidePageProps) {
  return (
    <div
      className={cn(
        widePageBaseClasses,
        pageShellInsetClasses[spacing],
        pageSpacingClasses[rhythm],
        className,
      )}
    >
      {children}
    </div>
  )
}
