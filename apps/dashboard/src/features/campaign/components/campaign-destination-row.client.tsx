'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Badge, Text } from '@rpg/ui'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CampaignDisplayName } from './campaign-display-name'
import {
  campaignDestinationChevronClasses,
  campaignDestinationRowVariants,
} from './campaign-destination.variants'
import { buildCampaignDisplay } from '../lib/campaign-display'
import {
  resolveCampaignEntryDestination,
  resolveEntryBadgeLabel,
  resolveEntryBadgeTone,
  shouldRunCampaignSelectionSideEffect,
} from '../lib/campaign-destination.lib'

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
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <CampaignDisplayName display={display} surface="row" />
          {badgeLabel && badgeTone ? (
            <Badge appearance="outline" tone={badgeTone} size="sm">
              {badgeLabel}
            </Badge>
          ) : null}
        </div>
        {destination.supportingCopy ? (
          <Text variant="small">{destination.supportingCopy}</Text>
        ) : null}
      </div>
      <ChevronRight aria-hidden className={campaignDestinationChevronClasses} />
    </Link>
  )
}
