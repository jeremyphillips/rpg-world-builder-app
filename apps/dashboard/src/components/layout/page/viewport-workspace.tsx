import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { viewportWorkspaceClasses } from './viewport-workspace.variants'

export interface ViewportWorkspaceProps {
  children: ReactNode
  className?: string
}

/**
 * Bounded multi-pane workspace — flex-fills the app-shell main column; panes own local scrollports.
 * Ordinary document-scroll routes must not use this primitive.
 */
export function ViewportWorkspace({ children, className }: ViewportWorkspaceProps) {
  return <div className={cn(viewportWorkspaceClasses, className)}>{children}</div>
}
