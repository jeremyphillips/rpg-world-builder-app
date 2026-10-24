import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'
import { PageShell } from '@/components/layout/page/page-shell'
import { pageShellInsetTopClasses } from '@/components/layout/page/page-spacing.variants'

export type CharacterBuilderPageShellProps = {
  children: ReactNode
  className?: string
}

/** Viewport-bound full-width shell — sole owner of ViewportWorkspace + PageShell for builder routes. */
export function CharacterBuilderPageShell({ children, className }: CharacterBuilderPageShellProps) {
  return (
    <ViewportWorkspace className={className}>
      <PageShell
        width="full"
        spacing="none"
        rhythm="relaxed"
        className={viewportWorkspacePaneClasses}
      >
        <div className={cn('flex min-h-0 flex-1 flex-col', pageShellInsetTopClasses)}>
          {children}
        </div>
      </PageShell>
    </ViewportWorkspace>
  )
}
