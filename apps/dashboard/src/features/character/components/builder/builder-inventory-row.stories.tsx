import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge, Text } from '@rpg/ui'

import { BuilderInventoryRow } from './builder-inventory-row.client'

const meta = {
  title: 'Character Builder/BuilderInventoryRow',
  component: BuilderInventoryRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BuilderInventoryRow>

export default meta
type Story = StoryObj<typeof BuilderInventoryRow>

export const Granted: Story = {
  args: {
    label: <Text as="span">DEX · Dexterity</Text>,
    sourceLabel: 'Granted by Rogue',
  },
}

export const WithMetaAndRemove: Story = {
  args: {
    label: <Text as="span">Stealth</Text>,
    meta: (
      <Badge variant="secondary" size="sm">
        Stale
      </Badge>
    ),
    sourceLabel: 'Chosen from Rogue Skills',
    onRemove: () => undefined,
  },
}
