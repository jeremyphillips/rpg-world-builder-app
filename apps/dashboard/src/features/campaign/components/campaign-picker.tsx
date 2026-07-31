'use client'

import type { CampaignListItem } from '@rpg/contracts'

import { CAMPAIGN_DESTINATION_COPY } from '../lib/campaign-destination-copy'
import { CampaignDestinationSection } from './campaign-destination-section.client'

interface CampaignPickerProps {
  campaigns: CampaignListItem[]
}

/** List of the user's campaigns shown on the campaigns index. */
export function CampaignPicker({ campaigns }: CampaignPickerProps) {
  return (
    <CampaignDestinationSection
      eyebrow={CAMPAIGN_DESTINATION_COPY.yourCampaignsEyebrow}
      eyebrowAs="h3"
      eyebrowTone="foreground"
      campaigns={campaigns}
    />
  )
}
