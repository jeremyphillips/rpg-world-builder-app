import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { viewportShellClasses } from './page-scroll.variants'

export interface ViewportShellProps {
  children: ReactNode
  className?: string
}

/** Route scroll boundary — bounded frame; feature panes may own deliberate scrollports. */
export function ViewportShell({ children, className }: ViewportShellProps) {
  return <div className={cn(viewportShellClasses, className)}>{children}</div>
}
