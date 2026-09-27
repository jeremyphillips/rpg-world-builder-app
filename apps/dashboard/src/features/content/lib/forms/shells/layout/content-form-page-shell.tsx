import type { ReactNode } from 'react'

import { PageShell } from '@/components/layout/page/page-shell'
import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'

import type { ContentFormPageWidth, ContentFormScrollMode } from './content-form-layout.lib'
import { contentFormPageShellBodyClasses } from './content-form-page-shell.variants'

export type { ContentFormPageWidth } from './content-form-layout.lib'

export interface ContentFormPageShellProps {
  scrollMode: ContentFormScrollMode
  pageWidth: ContentFormPageWidth
  children: ReactNode
  className?: string
}

/** Page width shell for content create/edit routes — scroll mode from layout resolver. */
export function ContentFormPageShell({
  scrollMode,
  pageWidth,
  children,
  className,
}: ContentFormPageShellProps) {
  if (scrollMode === 'document') {
    return <PageShell width={pageWidth}>{children}</PageShell>
  }

  return (
    <ViewportWorkspace className={className}>
      <PageShell width={pageWidth} spacing="none" className={viewportWorkspacePaneClasses}>
        {pageWidth === 'wide' ? (
          <div className={contentFormPageShellBodyClasses}>{children}</div>
        ) : (
          children
        )}
      </PageShell>
    </ViewportWorkspace>
  )
}
