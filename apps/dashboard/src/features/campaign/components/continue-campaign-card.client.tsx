'use client'

import type { CampaignListItem } from '@rpg/contracts'

import { CAMPAIGN_DESTINATION_COPY } from '../lib/campaign-destination-copy'
import { CampaignDestinationSection } from './campaign-destination-section.client'

interface ContinueCampaignCardProps {
  campaign: CampaignListItem
}

/** Promotes the user's remembered campaign from the global Dashboard. */
export function ContinueCampaignCard({ campaign }: ContinueCampaignCardProps) {
  return (
    <CampaignDestinationSection
      eyebrow={CAMPAIGN_DESTINATION_COPY.continueCampaignEyebrow}
      eyebrowAs="h2"
      eyebrowTone="foreground"
      campaigns={[campaign]}
    />
  )
}
