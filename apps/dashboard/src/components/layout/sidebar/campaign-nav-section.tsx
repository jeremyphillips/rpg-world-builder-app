import { useParams } from 'react-router-dom'

import { NavSection } from '@rpg/ui'

import { CampaignSwitcher } from '@/features/campaign'

import { NavItem } from './nav-item'

export function CampaignNavSection() {
  const { campaignId } = useParams<{ campaignId: string }>()

  return (
    <NavSection label="Campaign">
      <div className="py-1">
        <CampaignSwitcher />
      </div>
      {campaignId && (
        <>
          <NavItem to={`/campaigns/${campaignId}`} label="Overview" end />
          <NavItem to={`/campaigns/${campaignId}/sessions`} label="Sessions" />
        </>
      )}
    </NavSection>
  )
}
