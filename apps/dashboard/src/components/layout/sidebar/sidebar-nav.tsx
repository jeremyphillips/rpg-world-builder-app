import { useParams } from 'react-router-dom'

import { CampaignSidebarChrome, CampaignSidebarNavSections } from './campaign-sidebar-nav'
import { GlobalSidebarNav } from './global-sidebar-nav'
import {
  sidebarNavChromeClasses,
  sidebarNavHostClasses,
  sidebarNavScrollClasses,
} from './sidebar.variants'
import { resolveDashboardNavigationScope } from '@/components/layout/resolve-dashboard-navigation-scope'

export function SidebarNav() {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const scope = resolveDashboardNavigationScope({ campaignId })

  return (
    <div className={sidebarNavHostClasses}>
      {scope.kind === 'campaign' ? (
        <div className={sidebarNavChromeClasses}>
          <CampaignSidebarChrome campaignId={scope.campaignId} />
        </div>
      ) : null}
      <nav className={sidebarNavScrollClasses} aria-label="Primary">
        {scope.kind === 'campaign' ? (
          <CampaignSidebarNavSections campaignId={scope.campaignId} />
        ) : (
          <GlobalSidebarNav />
        )}
      </nav>
    </div>
  )
}
