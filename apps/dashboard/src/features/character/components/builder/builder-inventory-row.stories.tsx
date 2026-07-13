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
    itemLabel: 'DEX · Dexterity',
    sourceLabel: 'Granted by Rogue',
  },
}

export const WithMetaAndRemove: Story = {
  args: {
    label: <Text as="span">Stealth</Text>,
    itemLabel: 'Stealth',
    meta: (
      <Badge appearance="neutral" tone="neutral" size="sm">
        Stale
      </Badge>
    ),
    sourceLabel: 'Chosen from Rogue Skills',
    onRemove: () => undefined,
  },
}

export const Dense: Story = {
  args: {
    variant: 'dense',
    label: <Text as="span">Rations</Text>,
    itemLabel: 'Rations',
    provenance: <Text variant="caption">Purchased with starting gold · 5 SP each</Text>,
    onRemove: () => undefined,
  },
}
