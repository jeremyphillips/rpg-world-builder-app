import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterDetailStatTile } from './character-detail-stat-tile'

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
    footer: { kind: 'meta', text: '+2' },
  },
}

export const Speed: Story = {
  args: {
    label: 'Speed',
    value: '30',
    footer: { kind: 'meta', text: 'Walk' },
  },
}

export const Proficiency: Story = {
  args: {
    label: 'Proficiency',
    value: '+2',
    footer: { kind: 'label', text: 'Bonus' },
  },
}

export const HitPoints: Story = {
  args: {
    variant: 'hitPoints',
    label: 'Hit points',
    hitPoints: {
      current: '11',
      max: '11',
      temporary: '—',
    },
  },
}

export const StrongSurface: Story = {
  args: {
    label: 'Longsword',
    value: '+5',
    footer: { kind: 'meta', text: '1d8 +3 slashing' },
    surface: 'strong',
  },
}
