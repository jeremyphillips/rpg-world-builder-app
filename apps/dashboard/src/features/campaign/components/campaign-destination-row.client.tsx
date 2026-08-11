'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Badge } from '@rpg/ui'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EntityItem } from '@/features/content'

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
      <EntityItem
        density="comfortable"
        entity={{
          heading: display.name,
          description: destination.supportingCopy,
          status:
            badgeLabel && badgeTone
              ? [
                  <Badge appearance="outline" tone={badgeTone} size="sm">
                    {badgeLabel}
                  </Badge>,
                ]
              : undefined,
        }}
        trailing={{
          kind: 'indicator',
          content: <ChevronRight aria-hidden className={campaignDestinationChevronClasses} />,
        }}
      />
    </Link>
  )
}
