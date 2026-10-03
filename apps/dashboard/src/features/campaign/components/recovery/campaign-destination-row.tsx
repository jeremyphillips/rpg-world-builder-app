import type { CampaignListItem } from '@rpg/contracts'
import { Link } from 'react-router-dom'
import { IdentityFrame } from '@rpg/ui'

import { EntityAnatomyHost } from '@/features/content'

import { CampaignMetaLine } from '../campaign-meta-line'
import { campaignDestinationRowVariants } from './campaign-destination.variants'
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

type CampaignDestinationRowProps = {
  campaign: CampaignListItem
  onPersistSelection: (campaignId: string) => void
}

export function CampaignDestinationRow({
  campaign,
  onPersistSelection,
}: CampaignDestinationRowProps) {
  const destination = resolveCampaignEntryDestination(campaign)
  const display = buildCampaignDisplay(campaign)
  const gameMasterStyle = resolveCampaignGameMasterDisplayStyle()
  const meta = buildCampaignDestinationMeta(campaign, destination, gameMasterStyle)
  const badgeLabel = resolveEntryBadgeLabel(campaign)
  const badgeTone = resolveEntryBadgeTone(campaign)

  const description =
    destination.supportingCopy ?? (meta ? <CampaignMetaLine meta={meta} includeRecency /> : null)

  return (
    <Link
      to={destination.href}
      aria-label={destination.ariaLabel}
      className={campaignDestinationRowVariants()}
      onClick={(event) => {
        if (!destination.shouldPersistSelection || !shouldRunCampaignSelectionSideEffect(event)) {
          return
        }

        onPersistSelection(campaign.id)
      }}
    >
      <EntityAnatomyHost
        density="comfortable"
        entity={{
          heading: display.name,
          description,
          media: display.imageUrl ? (
            <IdentityFrame src={display.imageUrl} alt="" shape="box" size="sm" fit="contain" />
          ) : undefined,
          status:
            badgeLabel && badgeTone
              ? [{ kind: 'badge', label: badgeLabel, appearance: 'outline', tone: badgeTone }]
              : undefined,
        }}
        trailing={{ kind: 'indicator', variant: 'chevron' }}
      />
    </Link>
  )
}
