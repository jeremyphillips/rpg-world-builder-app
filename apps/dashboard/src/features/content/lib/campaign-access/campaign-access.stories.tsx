import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { CampaignAvailabilityField } from './campaign-availability-field'
import { CampaignAccessFormProvider } from './campaign-access-form-context'
import { ContentEditHeadingBadges } from './content-edit-heading-badges'

const meta = {
  title: 'Content/Campaign Access',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const FieldDefault: Story = {
  render: () => (
    <CampaignAccessFormProvider>
      <CampaignAvailabilityField
        campaignId="story-campaign"
        targetType="feats"
        entityId="story-feat"
      />
    </CampaignAccessFormProvider>
  ),
}

export const FieldDialog: Story = {
  render: () => (
    <CampaignAccessFormProvider>
      <CampaignAvailabilityField
        campaignId="story-campaign"
        targetType="feats"
        entityId="story-feat"
        presentation="dialog"
      />
    </CampaignAccessFormProvider>
  ),
}

export const FieldUnavailable: Story = {
  render: () => (
    <CampaignAccessFormProvider>
      <CampaignAvailabilityField
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
