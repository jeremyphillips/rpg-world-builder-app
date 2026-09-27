import type { ReactNode } from 'react'

import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'
import { PageShell } from '@/components/layout/page/page-shell'

import { characterBuilderPageShellBodyClasses } from './character-builder-page-shell.variants'

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
        <div className={characterBuilderPageShellBodyClasses}>{children}</div>
      </PageShell>
    </ViewportWorkspace>
  )
}
