import { useParams } from 'react-router-dom'

import { CampaignTopbarTitleSlot } from './campaign-topbar-title-slot'
import { PersonalWorkspaceTopbarTitle } from './personal-workspace-topbar-title'
import { resolveDashboardNavigationScope } from '@/components/layout/resolve-dashboard-navigation-scope'

/** Renders campaign or personal workspace context in the dashboard topbar. */
export function TopbarTitleSlot() {
  const { campaignId } = useParams()
  const scope = resolveDashboardNavigationScope({ campaignId })

  if (scope.kind === 'campaign') {
    return <CampaignTopbarTitleSlot />
  }

  return <PersonalWorkspaceTopbarTitle />
}
