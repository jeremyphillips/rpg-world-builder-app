import type { CampaignListItem } from '@rpg/contracts'
import { DestinationItem } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { EntityAnatomyHost } from '@/features/content'

import { CampaignMetaLine } from '../campaign-meta-line'
import {
  buildCampaignDisplay,
  resolveCampaignGameMasterDisplayStyle,
} from '../../lib/campaign-display'
import { buildCampaignDestinationMeta } from '../../lib/campaign-meta.lib'
import {
  resolveCampaignEntryDestination,
  resolveEntryBadgeLabel,
  resolveEntryBadgeTone,
  shouldRunCampaignSelectionSideEffect,
} from '../../lib/recovery/campaign-destination.lib'

type CampaignDestinationItemProps = {
  campaign: CampaignListItem
  onPersistSelection: (campaignId: string) => void
}

export function CampaignDestinationItem({
  campaign,
  onPersistSelection,
}: CampaignDestinationItemProps) {
  const destination = resolveCampaignEntryDestination(campaign)
  const display = buildCampaignDisplay(campaign)
  const gameMasterStyle = resolveCampaignGameMasterDisplayStyle()
  const meta = buildCampaignDestinationMeta(campaign, destination, gameMasterStyle)
  const badgeLabel = resolveEntryBadgeLabel(campaign)
  const badgeTone = resolveEntryBadgeTone(campaign)

  const description =
    destination.supportingCopy ?? (meta ? <CampaignMetaLine meta={meta} includeRecency /> : null)

  return (
    <DestinationItem
      link={
        <Link
          to={destination.href}
          aria-label={destination.ariaLabel}
          onClick={(event) => {
            if (
              !destination.shouldPersistSelection ||
              !shouldRunCampaignSelectionSideEffect(event)
            ) {
              return
            }

            onPersistSelection(campaign.id)
          }}
        />
      }
      content={
        <EntityAnatomyHost
          descriptionWrap
          entity={{
            heading: display.name,
            description,
            media: display.imageUrl ? (
              <img
                src={display.imageUrl}
                alt=""
                className="block size-full max-w-none select-none object-contain"
              />
            ) : undefined,
            status:
              badgeLabel && badgeTone
                ? [{ kind: 'badge', label: badgeLabel, appearance: 'outline', tone: badgeTone }]
                : undefined,
          }}
        />
      }
    />
  )
}
