import type { Meta, StoryObj } from '@storybook/react-vite'

import { RIDING_HORSE, ROWBOAT, TORCH } from '../fixtures'
import { EquipmentDetailContent } from './equipment-detail'

const meta = {
  title: 'Content/Equipment/EquipmentDetail',
  component: EquipmentDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentDetailContent>

export default meta
type Story = StoryObj

export const GearItem: Story = {
  render: () => <EquipmentDetailContent item={TORCH} />,
}

export const ShipItem: Story = {
  render: () => <EquipmentDetailContent item={ROWBOAT} />,
}

export const MountItem: Story = {
  render: () => <EquipmentDetailContent item={RIDING_HORSE} />,
}
