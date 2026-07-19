import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterDetailStatTile } from './character-detail-stat-tile.client'

const meta = {
  title: 'Character/CharacterDetailStatTile',
  component: CharacterDetailStatTile,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailStatTile>

export default meta
type Story = StoryObj<typeof CharacterDetailStatTile>

export const Ability: Story = {
  args: {
    label: 'Strength',
    value: '15',
    caption: '+2',
  },
}

export const Speed: Story = {
  args: {
    label: 'Speed',
    value: '30',
    caption: 'Walk',
  },
}

export const HitPointsCurrent: Story = {
  args: {
    label: 'Current',
    value: '11',
  },
}

export const StrongSurface: Story = {
  args: {
    label: 'Longsword',
    value: '+5',
    caption: '1d8 +3 slashing',
    surface: 'strong',
  },
}
