import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { AppBreadcrumb } from '@/components/layout/breadcrumb/app-breadcrumb'
import { useResolvedBreadcrumbs } from '@/components/layout/breadcrumb/use-resolved-breadcrumbs'
import { NarrowPage } from '@/components/layout/page/narrow-page'
import { WidePage } from '@/components/layout/page/wide-page'

import {
  contentFormInlineBreadcrumbClasses,
  contentFormPageShellClasses,
} from './content-form-page-shell.variants'

export interface ContentFormPageShellProps {
  usePreviewLayout: boolean
  children: ReactNode
  className?: string
}

export function ContentFormInlineBreadcrumb() {
  const crumbs = useResolvedBreadcrumbs()

  if (crumbs.length === 0) {
    return null
  }

  return (
    <div className={contentFormInlineBreadcrumbClasses}>
      <AppBreadcrumb crumbs={crumbs} />
    </div>
  )
}

/** Page width shell for content create/edit routes — NarrowPage by default, WidePage when preview is registered. */
export function ContentFormPageShell({
  usePreviewLayout,
  children,
  className,
}: ContentFormPageShellProps) {
  if (!usePreviewLayout) {
    return (
      <NarrowPage spacing="relaxed" className={cn(contentFormPageShellClasses, className)}>
        {children}
      </NarrowPage>
    )
  }

  return (
    <WidePage spacing="relaxed" className={cn(contentFormPageShellClasses, className)}>
      {children}
    </WidePage>
  )
}
