import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { EquipmentHubContent } from './equipment-hub'

const meta = {
  title: 'Content/Equipment/EquipmentHub',
  component: EquipmentHubContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof EquipmentHubContent>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <EquipmentHubContent campaignId={STORY_CAMPAIGN_ID} />,
}
