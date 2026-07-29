import type { Meta, StoryObj } from '@storybook/react-vite'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL, SILVER_CIRCLE } from '../fixtures'
import { OrganizationDetailContent } from './organization-detail'

const meta = {
  title: 'Content/Organizations/OrganizationDetail',
  component: OrganizationDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationDetailContent>

export default meta
type Story = StoryObj<typeof meta>

export const Government: Story = {
  args: { organization: CITY_COUNCIL, campaignId: STORY_CAMPAIGN_ID },
}

export const Academic: Story = {
  args: { organization: SILVER_CIRCLE, campaignId: STORY_CAMPAIGN_ID },
}
