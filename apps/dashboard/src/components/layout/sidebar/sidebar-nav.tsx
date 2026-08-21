import { useParams } from 'react-router-dom'

import { CampaignSidebarNav } from './campaign-sidebar-nav'
import { GlobalSidebarNav } from './global-sidebar-nav'
import { resolveDashboardNavigationScope } from '@/components/layout/resolve-dashboard-navigation-scope'

export function SidebarNav() {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const scope = resolveDashboardNavigationScope({ campaignId })

  return (
    <nav className="flex flex-col overflow-y-auto px-3 pb-4" aria-label="Primary">
      {scope.kind === 'campaign' ? (
        <CampaignSidebarNav campaignId={scope.campaignId} />
      ) : (
        <GlobalSidebarNav />
      )}
    </nav>
  )
}
