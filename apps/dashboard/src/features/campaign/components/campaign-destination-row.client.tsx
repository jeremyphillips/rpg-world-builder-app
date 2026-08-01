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
  CAMPAIGN_ONBOARDING_INCOMPLETE_COPY,
  CAMPAIGN_PARTICIPATION_INVALID_BADGE,
} from '../lib/campaign-onboarding-copy'
import {
  isCampaignParticipationInvalid,
  resolveCampaignRecoveryState,
} from '../lib/campaign-recovery-state'
import {
  resolveCampaignDestination,
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
  const destination = resolveCampaignDestination(campaign)
  const display = buildCampaignDisplay(campaign)
  const recovery = resolveCampaignRecoveryState(campaign)
  const badgeLabel = isCampaignParticipationInvalid(recovery)
    ? CAMPAIGN_PARTICIPATION_INVALID_BADGE
    : CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.badge

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
            <Badge
              appearance="outline"
              tone={isCampaignParticipationInvalid(recovery) ? 'destructive' : 'warning'}
              size="sm"
            >
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
