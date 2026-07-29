import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { CampaignAccessSection } from './campaign-access-section.client'
import { CampaignAccessFormProvider } from './campaign-access-form-context.client'
import { ContentEditHeadingBadges } from './content-edit-heading-badges.client'

const meta = {
  title: 'Content/Campaign Access',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SectionDefault: Story = {
  render: () => (
    <CampaignAccessFormProvider>
      <CampaignAccessSection campaignId="story-campaign" targetType="feats" entityId="story-feat" />
    </CampaignAccessFormProvider>
  ),
}

export const SectionUnavailable: Story = {
  render: () => (
    <CampaignAccessFormProvider>
      <CampaignAccessSection
        campaignId="story-campaign"
        targetType="feats"
        entityId="story-feat"
        initialAccess={{
          ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
          available: false,
          visibilityMode: 'dm_only',
          effectiveAudience: 'none',
        }}
      />
    </CampaignAccessFormProvider>
  ),
}

export const HeadingBadgesDraftHomebrew: Story = {
  render: () => (
    <ContentEditHeadingBadges
      contentType="feats"
      source="homebrew"
      status="draft"
      campaignAccess={DEFAULT_CONTENT_CAMPAIGN_ACCESS}
    />
  ),
}

export const HeadingBadgesInactiveSystem: Story = {
  render: () => (
    <ContentEditHeadingBadges
      contentType="feats"
      source="system"
      status="published"
      campaignAccess={{
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none',
      }}
    />
  ),
}
