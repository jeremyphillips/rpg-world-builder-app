import type { Meta, StoryObj } from '@storybook/react-vite'

import { LONGSWORD, SHORTBOW } from '../fixtures'
import { WeaponDetailContent } from './weapon-detail'

const meta = {
  title: 'Content/Weapons/WeaponDetail',
  component: WeaponDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WeaponDetailContent>

export default meta
type Story = StoryObj

export const MeleeWeapon: Story = {
  render: () => <WeaponDetailContent item={LONGSWORD} />,
}

export const RangedWeapon: Story = {
  render: () => <WeaponDetailContent item={SHORTBOW} />,
}
