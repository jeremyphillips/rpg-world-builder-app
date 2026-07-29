import { CampaignSwitcher } from '@/features/campaign'

import { AdminNavSection } from './admin-nav-section'
import { CampaignNavSection } from './campaign-nav-section'
import { ManageNavSection } from './manage-nav-section'

interface CampaignSidebarNavProps {
  campaignId: string
}

/** Campaign workspace navigation — rendered only under `CampaignLayoutRoute`. */
export function CampaignSidebarNav(_props: CampaignSidebarNavProps) {
  return (
    <>
      <div className="py-1">
        <CampaignSwitcher showLabel={false} />
      </div>
      <CampaignNavSection />
      <ManageNavSection />
      <AdminNavSection />
    </>
  )
}
