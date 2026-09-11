import type { ReactNode } from 'react'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { WidePage } from '@/components/layout/page/wide-page'

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
  if (!usePreviewLayout) {
    return (
      <NarrowPage scroll="viewport" spacing="none" className={className}>
        {children}
      </NarrowPage>
    )
  }

  return (
    <WidePage scroll="viewport" spacing="none" className={className}>
      {children}
    </WidePage>
  )
}
