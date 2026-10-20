import type { Meta, StoryObj } from '@storybook/react-vite'

import { EntityCard } from '@/features/content'
import { Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from './builder-inventory-remove-action'

const meta = {
  title: 'Character Builder/BuilderSelectedEntityCard',
  component: EntityCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EntityCard>

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
      status: [{ kind: 'badge', label: 'Stale', appearance: 'soft', tone: 'neutral' }],
    },
    trailing: {
      kind: 'utility',
      content: <BuilderInventoryRemoveAction itemLabel="Stealth" onRemove={() => undefined} />,
    },
    density: 'compact',
  },
}
