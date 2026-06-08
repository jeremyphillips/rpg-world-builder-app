import { useParams } from 'react-router-dom'

import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
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
          <NavItem to={ROUTES.campaign.detail(campaignId)} label="Overview" end />
          <NavItem to={ROUTES.campaign.sessions(campaignId)} label="Sessions" />
        </>
      )}
    </NavSection>
  )
}
