import { useContext } from 'react'

import { AppBreadcrumb } from '@/components/layout/breadcrumb/app-breadcrumb'
import { useResolvedBreadcrumbs } from '@/components/layout/breadcrumb/use-resolved-breadcrumbs'
import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'

/** Sticky row: breadcrumbs plus route-registered page actions (outside the breadcrumb nav). */
export function DetailPageHeader() {
  const crumbs = useResolvedBreadcrumbs()
  const chromeActions = useContext(PageChromeActionsContext)
  const actions = chromeActions?.actions

  if (crumbs.length === 0 && !actions) {
    return null
  }

  return (
    <div className="flex h-8 shrink-0 items-center justify-between gap-4" data-detail-page-header>
      <div className="min-w-0 flex-1">
        {crumbs.length > 0 ? <AppBreadcrumb crumbs={crumbs} /> : null}
      </div>
      {actions ? (
        <div
          className="flex shrink-0 items-center justify-end gap-2"
          role="toolbar"
          aria-label="Page actions"
        >
          {actions}
        </div>
      ) : null}
    </div>
  )
}
