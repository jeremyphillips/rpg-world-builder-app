import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberStepper, Text } from '@rpg/ui'

import { DrawerEntityContext } from '../drawer-entity-context'

const meta = {
  title: 'Content/Entity/DrawerEntityContext',
  component: DrawerEntityContext,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DrawerEntityContext>

export default meta
type Story = StoryObj<typeof DrawerEntityContext>

export const WeaponWithStepper: Story = {
  args: {
    heading: 'Shortsword',
    metadata: ['Simple', 'Melee'],
    fallback: 'equipment',
    trailing: (
      <NumberStepper size="sm" value={1} min={1} onChange={() => undefined} aria-label="Quantity" />
    ),
  },
}

export const NarrowWithLongHeading: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    heading: 'Bracers of Defense +1 with an unusually long custom name',
    metadata: ['Wondrous item', 'Rare'],
    fallback: 'equipment',
    trailing: <Text variant="muted">×1 (separated on save)</Text>,
  },
}
