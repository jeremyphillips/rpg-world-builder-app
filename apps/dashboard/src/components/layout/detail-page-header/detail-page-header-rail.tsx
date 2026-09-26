import { useContext } from 'react'

import { useResolvedBreadcrumbs } from '@/components/layout/breadcrumb/use-resolved-breadcrumbs'
import { appShellBreadcrumbRailClasses } from '@/components/layout/shell/app-shell.variants'
import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'

import { DetailPageHeader } from './detail-page-header'

/** Sticky shell rail — omitted when there are no breadcrumbs and no registered actions. */
export function DetailPageHeaderRail() {
  const crumbs = useResolvedBreadcrumbs()
  const actions = useContext(PageChromeActionsContext)?.actions

  if (crumbs.length === 0 && !actions) {
    return null
  }

  return (
    <div className={appShellBreadcrumbRailClasses}>
      <DetailPageHeader />
    </div>
  )
}
