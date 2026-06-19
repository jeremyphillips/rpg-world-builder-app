import type { Meta, StoryObj } from '@storybook/react-vite'

import { CHAIN_MAIL, LEATHER, SHIELD } from '../fixtures'
import { ArmorDetailContent } from './armor-detail'

const meta = {
  title: 'Content/Armor/ArmorDetail',
  component: ArmorDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ArmorDetailContent>

export default meta
type Story = StoryObj

export const LightArmor: Story = {
  render: () => <ArmorDetailContent item={LEATHER} />,
}

export const HeavyArmor: Story = {
  render: () => <ArmorDetailContent item={CHAIN_MAIL} />,
}

export const Shield: Story = {
  render: () => <ArmorDetailContent item={SHIELD} />,
}
