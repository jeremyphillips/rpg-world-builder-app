import type { ReactNode } from 'react'

import { viewportFillClasses } from '@/components/layout/page/page-scroll.variants'
import { NarrowPage } from '@/components/layout/page/narrow-page'
import { ViewportShell } from '@/components/layout/page/viewport-shell'
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
  const widthShell = usePreviewLayout ? (
    <WidePage spacing="none" className={viewportFillClasses}>
      <div className={contentFormPageShellBodyClasses}>{children}</div>
    </WidePage>
  ) : (
    <NarrowPage spacing="none" className={viewportFillClasses}>
      {children}
    </NarrowPage>
  )

  return (
    <ViewportShell className={className}>
      <div className={viewportFillClasses}>{widthShell}</div>
    </ViewportShell>
  )
}
