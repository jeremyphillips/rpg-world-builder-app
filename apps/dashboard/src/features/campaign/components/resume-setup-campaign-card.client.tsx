'use client'

import type { CampaignListItem } from '@rpg/contracts'

import { CAMPAIGN_DESTINATION_COPY } from '../lib/campaign-destination-copy'
import { CampaignDestinationSection } from './campaign-destination-section.client'

interface ResumeSetupCampaignCardProps {
  campaign: CampaignListItem
}

/** Prompts the user to finish onboarding for a remembered incomplete campaign. */
export function ResumeSetupCampaignCard({ campaign }: ResumeSetupCampaignCardProps) {
  return (
    <CampaignDestinationSection
      eyebrow={CAMPAIGN_DESTINATION_COPY.resumeSetupEyebrow}
      eyebrowAs="h2"
      campaigns={[campaign]}
    />
  )
}
