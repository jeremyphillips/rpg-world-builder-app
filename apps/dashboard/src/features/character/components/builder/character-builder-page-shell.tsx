import type { ReactNode } from 'react'

import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'
import { WidePage } from '@/components/layout/page/wide-page'

import { characterBuilderPageShellBodyClasses } from './character-builder-page-shell.variants'

export type CharacterBuilderPageShellProps = {
  children: ReactNode
  className?: string
}

/** Viewport-bound wide page shell — sole owner of ViewportWorkspace + WidePage for builder routes. */
export function CharacterBuilderPageShell({ children, className }: CharacterBuilderPageShellProps) {
  return (
    <ViewportWorkspace className={className}>
      <WidePage spacing="none" rhythm="relaxed" className={viewportWorkspacePaneClasses}>
        <div className={characterBuilderPageShellBodyClasses}>{children}</div>
      </WidePage>
    </ViewportWorkspace>
  )
}
