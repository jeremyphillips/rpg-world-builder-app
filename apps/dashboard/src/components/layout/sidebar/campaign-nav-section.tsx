import { useParams } from 'react-router-dom'
import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  useCampaignCharacterNavigationContext,
  isCampaignCharactersNavActive,
} from '@/features/campaign'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'

import { NavItem } from './nav-item'

export function CampaignNavSection() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { nav } = useCampaignCharacterNavigationContext(campaignId)

  if (!campaignId) return null

  return (
    <NavSection label="Campaign">
      <NavItem to={ROUTES.campaign.detail(campaignId)} label="Overview" end />
      <NavItem to={ROUTES.campaign.sessions(campaignId)} label="Sessions" />
      {nav.showCharactersNav ? (
        <NavItem
          to={nav.href}
          label={nav.label}
          isActive={(currentPathname) =>
            isCampaignCharactersNavActive(currentPathname, nav, campaignId)
          }
        />
      ) : null}
      <NavItem to={ROUTES.campaign.npcs.list(campaignId)} label="NPCs" />
      {VISIBLE_SIDEBAR_CONTENT.map((entry) => (
        <NavItem key={entry.contentType} to={entry.overview(campaignId)} label={entry.label} />
      ))}
      <NavItem to={ROUTES.homebrew.hub(campaignId)} label="Homebrew" />
    </NavSection>
  )
}
