import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CampaignSwitcher } from '@/features/campaign'
import { useCampaignStore } from '@/features/campaign/store/campaign-store'

import { NavItem } from './nav-item'

export function CampaignNavSection() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId)

  return (
    <NavSection label="Campaign">
      <div className="py-1">
        <CampaignSwitcher showLabel={false} />
      </div>
      {activeCampaignId && (
        <>
          <NavItem to={ROUTES.campaign.detail(activeCampaignId)} label="Overview" end />
          <NavItem to={ROUTES.campaign.sessions(activeCampaignId)} label="Sessions" />
          <NavItem to={ROUTES.content.classes.overview(activeCampaignId)} label="Classes" />
          <NavItem to={ROUTES.content.spells.overview(activeCampaignId)} label="Spells" />
          <NavItem to={ROUTES.content.species.overview(activeCampaignId)} label="Species" />
          <NavItem to={ROUTES.content.feats.overview(activeCampaignId)} label="Feats" />
          <NavItem to={ROUTES.content.equipment.hub(activeCampaignId)} label="Equipment" />
          <NavItem
            to={ROUTES.content.skillProficiencies.overview(activeCampaignId)}
            label="Skill Proficiencies"
          />
        </>
      )}
    </NavSection>
  )
}
