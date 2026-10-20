import type { CampaignListItem } from '@rpg/contracts'

import { CAMPAIGN_DESTINATION_COPY } from '../lib/recovery/campaign-destination-copy'
import { CampaignDestinationSection } from './recovery/campaign-destination-section'

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
