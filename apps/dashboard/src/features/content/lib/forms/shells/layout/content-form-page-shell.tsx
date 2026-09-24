import type { ReactNode } from 'react'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { ViewportWorkspace } from '@/components/layout/page/viewport-workspace'
import { viewportWorkspacePaneClasses } from '@/components/layout/page/viewport-workspace.variants'
import { WidePage } from '@/components/layout/page/wide-page'

import type { ContentFormPageWidth, ContentFormScrollMode } from './content-form-layout.lib'
import { contentFormPageShellBodyClasses } from './content-form-page-shell.variants'

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
    return pageWidth === 'wide' ? (
      <WidePage>{children}</WidePage>
    ) : (
      <NarrowPage>{children}</NarrowPage>
    )
  }

  return (
    <ViewportWorkspace className={className}>
      {pageWidth === 'wide' ? (
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
