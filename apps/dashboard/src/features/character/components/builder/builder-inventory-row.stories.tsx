import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentEntityCard } from '@/features/content'
import { Badge, Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from './builder-inventory-remove-action.client'

const meta = {
  title: 'Character Builder/BuilderSelectedEntityCard',
  component: ContentEntityCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentEntityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Granted: Story = {
  args: {
    entity: {
      heading: 'DEX · Dexterity',
      description: (
        <Text as="span" variant="muted">
          Granted by Rogue
        </Text>
      ),
    },
    density: 'compact',
  },
}

export const WithMetaAndRemove: Story = {
  args: {
    entity: {
      heading: 'Stealth',
      description: (
        <Text as="span" variant="muted">
          Chosen from Rogue Skills
        </Text>
      ),
      status: [
        <Badge key="stale" appearance="neutral" tone="neutral" size="sm">
          Stale
        </Badge>,
      ],
    },
    trailing: {
      kind: 'action',
      content: <BuilderInventoryRemoveAction itemLabel="Stealth" onRemove={() => undefined} />,
    },
    density: 'compact',
  },
}
