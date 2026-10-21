import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { EQUIPMENT_FAMILY_PATHS } from '../lib/shared/equipment-family-paths'
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
  play: async ({ canvasElement }) => {
    const chevrons = canvasElement.querySelectorAll('.ui-card__nav-chevron')
    expect(chevrons.length).toBe(EQUIPMENT_FAMILY_PATHS.length)
  },
}
