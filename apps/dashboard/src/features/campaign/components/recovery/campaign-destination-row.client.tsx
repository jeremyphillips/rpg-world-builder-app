'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Link } from 'react-router-dom'

import { EntityAnatomyHost } from '@/features/content'

import { campaignDestinationRowVariants } from './campaign-destination.variants'
import { buildCampaignDisplay } from '../../lib/campaign-display'
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
  const badgeLabel = resolveEntryBadgeLabel(campaign)
  const badgeTone = resolveEntryBadgeTone(campaign)

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
          description: destination.supportingCopy,
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
