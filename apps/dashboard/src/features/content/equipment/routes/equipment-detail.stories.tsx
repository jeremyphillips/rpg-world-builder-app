import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { BRACERS_OF_DEFENSE, LEATHER, LONGSWORD, RIDING_HORSE, ROWBOAT, TORCH } from '../fixtures'
import { EquipmentDetailContent } from './equipment-detail'

const meta = {
  title: 'Content/Equipment/EquipmentDetail',
  component: EquipmentDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof EquipmentDetailContent>

export default meta
type Story = StoryObj

export const Weapon: Story = {
  render: () => <EquipmentDetailContent item={LONGSWORD} campaignId={STORY_CAMPAIGN_ID} />,
}

export const Armor: Story = {
  render: () => <EquipmentDetailContent item={LEATHER} campaignId={STORY_CAMPAIGN_ID} />,
}

export const AdventuringGear: Story = {
  render: () => <EquipmentDetailContent item={TORCH} campaignId={STORY_CAMPAIGN_ID} />,
}

export const Vehicle: Story = {
  render: () => <EquipmentDetailContent item={ROWBOAT} campaignId={STORY_CAMPAIGN_ID} />,
}

export const Mount: Story = {
  render: () => <EquipmentDetailContent item={RIDING_HORSE} campaignId={STORY_CAMPAIGN_ID} />,
}

export const MagicItem: Story = {
  render: () => <EquipmentDetailContent item={BRACERS_OF_DEFENSE} campaignId={STORY_CAMPAIGN_ID} />,
}
