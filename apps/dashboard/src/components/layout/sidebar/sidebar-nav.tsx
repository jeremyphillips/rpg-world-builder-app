import { useParams } from 'react-router-dom'
import { boundedScrollRegionClasses, cn } from '@rpg/ui'

import { CampaignSidebarChrome, CampaignSidebarNavSections } from './campaign-sidebar-nav'
import { GlobalSidebarNav } from './global-sidebar-nav'
import { resolveDashboardNavigationScope } from '@/components/layout/resolve-dashboard-navigation-scope'

export function SidebarNav() {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const scope = resolveDashboardNavigationScope({ campaignId })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {scope.kind === 'campaign' ? (
        <div className="shrink-0 px-3">
          <CampaignSidebarChrome campaignId={scope.campaignId} />
        </div>
      ) : null}
      <nav
        className={cn('flex min-h-0 flex-1 flex-col ps-3 pb-4', boundedScrollRegionClasses)}
        aria-label="Primary"
      >
        {scope.kind === 'campaign' ? (
          <CampaignSidebarNavSections campaignId={scope.campaignId} />
        ) : (
          <GlobalSidebarNav />
        )}
      </nav>
    </div>
  )
}
