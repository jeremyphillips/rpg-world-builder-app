import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Campaign, CampaignListItem } from '@rpg/contracts'
import {
  Badge,
  Heading,
  Hero,
  RowActionsMenu,
  ActionIcon,
  heroMarkFrameClasses,
  heroMarkImageClasses,
  heroMediaImageClasses,
  type RowActionsMenuLinkProps,
} from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { MESSAGES_ACTION_COPY } from '@/features/message'

import { CampaignMetaLine } from '../campaign-meta-line'
import { InviteMemberDialog } from './invite-member-dialog'
import { buildCampaignOverviewHeroBadges } from '../../lib/overview/campaign-overview-hero-meta.lib'
import {
  resolveCampaignBannerImageUrl,
  resolveCampaignEmblemImageUrl,
} from '../../lib/overview/campaign-overview-hero-media.lib'
import { resolveCampaignGameMasterDisplayStyle } from '../../lib/campaign-display'
import { buildCampaignMeta, isCampaignListItem } from '../../lib/campaign-meta.lib'

type CampaignOverviewHeroProps = {
  campaign: Campaign | CampaignListItem
  campaignId: string
  canManage: boolean
}

function CampaignOverviewHeroRouterLink({ href, className, children }: RowActionsMenuLinkProps) {
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export function CampaignOverviewHero({
  campaign,
  campaignId,
  canManage,
}: CampaignOverviewHeroProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const bannerUrl = resolveCampaignBannerImageUrl(campaign.identity.media)
  const emblemUrl = resolveCampaignEmblemImageUrl(campaign.identity.media)
  const gameMasterStyle = resolveCampaignGameMasterDisplayStyle()

  const meta = useMemo(
    () => (isCampaignListItem(campaign) ? buildCampaignMeta(campaign, gameMasterStyle) : null),
    [campaign, gameMasterStyle],
  )

  const flavorBadges = useMemo(
    () => buildCampaignOverviewHeroBadges(campaign.configuration.flavor),
    [campaign.configuration.flavor],
  )

  const menuItems = [
    ...(canManage
      ? [
          {
            kind: 'action' as const,
            id: 'invite-member',
            label: 'Invite member',
            icon: <ActionIcon action="invite" step="md" />,
            onSelect: () => setInviteOpen(true),
          },
        ]
      : []),
    {
      kind: 'link' as const,
      id: 'view-campaign-messages',
      label: MESSAGES_ACTION_COPY.viewForCampaign,
      href: ROUTES.messages.listScoped(campaignId),
    },
    {
      kind: 'link' as const,
      id: 'view-all-messages',
      label: MESSAGES_ACTION_COPY.viewAll,
      href: ROUTES.messages.list,
    },
  ]

  return (
    <>
      <Hero
        media={
          bannerUrl ? <img alt="" className={heroMediaImageClasses} src={bannerUrl} /> : undefined
        }
        mark={
          emblemUrl ? (
            <div className={heroMarkFrameClasses}>
              <img alt="" className={heroMarkImageClasses} src={emblemUrl} />
            </div>
          ) : undefined
        }
        markPlacement={bannerUrl ? 'overlap' : 'inline'}
        title={
          <Heading variant="heroTitle" as="h1" className="truncate">
            {campaign.identity.name}
          </Heading>
        }
        actions={
          <RowActionsMenu
            triggerLabel={`Open actions for ${campaign.identity.name}`}
            triggerVariant="outline-icon"
            LinkComponent={CampaignOverviewHeroRouterLink}
            items={menuItems}
          />
        }
        meta={meta ? <CampaignMetaLine meta={meta} includeRecency={false} /> : undefined}
        secondary={
          flavorBadges ? (
            <div className="flex flex-wrap gap-1.5">
              {flavorBadges.visible.map((badge) => (
                <Badge key={badge.id} appearance="soft" tone="neutral" size="sm">
                  {badge.label}
                </Badge>
              ))}
              {flavorBadges.overflowCount > 0 ? (
                <Badge appearance="soft" tone="neutral" size="sm">
                  +{flavorBadges.overflowCount}
                </Badge>
              ) : null}
            </div>
          ) : undefined
        }
      />
      {canManage ? (
        <InviteMemberDialog
          campaignId={campaignId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          showTrigger={false}
        />
      ) : null}
    </>
  )
}
