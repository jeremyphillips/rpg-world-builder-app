import { useContext } from 'react'

import { AppBreadcrumb } from '@/components/layout/breadcrumb/app-breadcrumb'
import { useResolvedBreadcrumbs } from '@/components/layout/breadcrumb/use-resolved-breadcrumbs'
import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'

import {
  detailPageHeaderActionsClasses,
  detailPageHeaderBreadcrumbClasses,
  detailPageHeaderClasses,
} from './detail-page-header.variants'

/** Sticky row: breadcrumbs plus route-registered page actions (outside the breadcrumb nav). */
export function DetailPageHeader() {
  const crumbs = useResolvedBreadcrumbs()
  const chromeActions = useContext(PageChromeActionsContext)
  const actions = chromeActions?.actions

  if (crumbs.length === 0 && !actions) {
    return null
  }

  return (
    <div className={detailPageHeaderClasses} data-detail-page-header>
      <div className={detailPageHeaderBreadcrumbClasses}>
        {crumbs.length > 0 ? <AppBreadcrumb crumbs={crumbs} /> : null}
      </div>
      {actions ? (
        <div className={detailPageHeaderActionsClasses} role="toolbar" aria-label="Page actions">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
