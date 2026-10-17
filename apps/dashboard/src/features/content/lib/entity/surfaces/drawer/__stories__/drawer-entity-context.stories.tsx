import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberStepper, Text } from '@rpg/ui'

import { buildEquipmentEntitySurfaceIdentity } from '../../../../../equipment/lib/equipment-entity-surface-identity.lib'
import { DrawerEntityContext } from '../drawer-entity-context'

const meta = {
  title: 'Content/Entity/DrawerEntityContext',
  component: DrawerEntityContext,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DrawerEntityContext>

export default meta
type Story = StoryObj<typeof DrawerEntityContext>

const weaponIdentity = buildEquipmentEntitySurfaceIdentity({
  heading: 'Shortsword',
  metadataSegments: ['Simple', 'Melee'],
  displayImage: undefined,
})

export const WeaponWithStepper: Story = {
  args: {
    surface: { identity: weaponIdentity },
    trailing: {
      kind: 'utility',
      content: (
        <NumberStepper
          size="sm"
          value={1}
          min={1}
          onChange={() => undefined}
          aria-label="Quantity"
        />
      ),
    },
  },
}

export const NarrowWithLongHeading: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    surface: {
      identity: buildEquipmentEntitySurfaceIdentity({
        heading: 'Bracers of Defense +1 with an unusually long custom name',
        metadataSegments: ['Wondrous item', 'Rare'],
        displayImage: undefined,
      }),
    },
    trailing: {
      kind: 'utility',
      content: <Text variant="muted">×1 (separated on save)</Text>,
    },
  },
}
