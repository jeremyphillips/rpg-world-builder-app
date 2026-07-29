import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CampaignSwitcher, useActiveCampaignId } from '@/features/campaign'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'

import { NavItem } from './nav-item'

export function CampaignNavSection() {
  const activeCampaignId = useActiveCampaignId()

  return (
    <NavSection label="Campaign">
      <div className="py-1">
        <CampaignSwitcher showLabel={false} />
      </div>
      {activeCampaignId && (
        <>
          <NavItem to={ROUTES.campaign.detail(activeCampaignId)} label="Overview" end />
          <NavItem to={ROUTES.campaign.sessions(activeCampaignId)} label="Sessions" />
          <NavItem to={ROUTES.campaign.npcs.list(activeCampaignId)} label="NPCs" />
          {VISIBLE_SIDEBAR_CONTENT.map((entry) => (
            <NavItem
              key={entry.contentType}
              to={entry.overview(activeCampaignId)}
              label={entry.label}
            />
          ))}
          <NavItem to={ROUTES.homebrew.hub(activeCampaignId)} label="Homebrew" />
        </>
      )}
    </NavSection>
  )
}
