import type { ReactNode } from 'react'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'
import { WidePage } from '@/components/layout/page/wide-page'

import { contentFormPageShellBodyClasses } from './content-form-page-shell.variants'

export interface ContentFormPageShellProps {
  usePreviewLayout: boolean
  children: ReactNode
  className?: string
}

/** Page width shell for content create/edit routes — viewport-bound; form owns scroll. */
export function ContentFormPageShell({
  usePreviewLayout,
  children,
  className,
}: ContentFormPageShellProps) {
  return (
    <ViewportWorkspace className={className}>
      {usePreviewLayout ? (
        <WidePage spacing="none" className={viewportWorkspacePaneClasses}>
          <div className={contentFormPageShellBodyClasses}>{children}</div>
        </WidePage>
      ) : (
        <NarrowPage spacing="none" className={viewportWorkspacePaneClasses}>
          {children}
        </NarrowPage>
      )}
    </ViewportWorkspace>
  )
}
