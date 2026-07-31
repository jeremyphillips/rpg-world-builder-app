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
import { CAMPAIGN_ONBOARDING_INCOMPLETE_COPY } from '../lib/campaign-onboarding-copy'
import {
  resolveCampaignPickerRowDestination,
  shouldRunCampaignSelectionSideEffect,
} from '../lib/campaign-picker-row.lib'

type CampaignDestinationRowProps = {
  campaign: CampaignListItem
  onPersistSelection: (campaignId: string) => void
}

export function CampaignDestinationRow({
  campaign,
  onPersistSelection,
}: CampaignDestinationRowProps) {
  const destination = resolveCampaignPickerRowDestination(campaign)
  const display = buildCampaignDisplay(campaign)

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
          {destination.showSetupBadge ? (
            <Badge appearance="outline" tone="warning" size="sm">
              {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.label}
            </Badge>
          ) : null}
        </div>
        {destination.supportingCopy ? (
          <Text variant="small" className="text-muted-foreground">
            {destination.supportingCopy}
          </Text>
        ) : null}
      </div>
      <ChevronRight aria-hidden className={campaignDestinationChevronClasses} />
    </Link>
  )
}
