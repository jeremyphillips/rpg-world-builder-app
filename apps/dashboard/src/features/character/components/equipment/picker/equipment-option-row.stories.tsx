import type { Meta, StoryObj } from '@storybook/react-vite'

import { EquipmentOptionRow } from './equipment-option-row'
import type { EquipmentOptionRowPresentation } from '../../../lib/equipment/equipment-option-row-presentation.lib'

const base = {
  identity: 'Longsword',
  kindLabel: 'Weapon',
  metadata: ['1d8 Slashing'],
  secondaryClauses: [],
  disabled: false,
} satisfies EquipmentOptionRowPresentation

const meta = {
  title: 'Character Builder/EquipmentOptionRow',
  component: EquipmentOptionRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentOptionRow>

export default meta
type Story = StoryObj<typeof meta>

export const Recommended: Story = {
  args: {
    presentation: {
      ...base,
      secondaryClauses: [
        {
          kind: 'recommendation',
          label: 'Recommended by Fighter class',
          badgeLabel: 'Recommended',
          sourceLabels: ['Fighter class'],
          discriminator: 'recommended',
        },
      ],
      secondaryTitle: 'Recommended by Fighter class',
    },
  },
}

export const RequiredAndNotProficient: Story = {
  args: {
    presentation: {
      ...base,
      metadata: [],
      secondaryClauses: [
        {
          kind: 'requirement',
          label: 'Required by Wizard class',
          badgeLabel: 'Required by Wizard class',
          sourceLabels: ['Wizard class'],
          discriminator: 'required',
        },
        {
          kind: 'compatibility',
          label: 'Not proficient with this weapon',
          badgeLabel: 'Not proficient with this weapon',
          sourceLabels: [],
          discriminator: 'not-proficient',
        },
        {
          kind: 'recommendation',
          label: 'Recommended by Fighter class',
          badgeLabel: 'Recommended',
          sourceLabels: ['Fighter class'],
          discriminator: 'recommended',
        },
      ],
      secondaryTitle:
        'Required by Wizard class · Not proficient with this weapon · Recommended by Fighter class',
    },
  },
}

export const OwnedQuantity: Story = {
  args: {
    presentation: {
      ...base,
      trailingState: { label: '×1', accessibleLabel: 'Quantity 1' },
      secondaryClauses: [
        {
          kind: 'supply',
          label: 'Guard role',
          badgeLabel: 'Guard role',
          sourceLabels: [],
        },
      ],
      secondaryTitle: 'Guard role',
      disabled: false,
    },
  },
}

export const LongName: Story = {
  render: (args) => (
    <div className="w-56 border border-border p-2">
      <EquipmentOptionRow {...args} />
    </div>
  ),
  args: {
    presentation: {
      ...base,
      identity: 'Very Long Weapon Name That Should Truncate Before The Quantity',
      trailingState: { label: '×2', accessibleLabel: 'Quantity 2' },
      secondaryClauses: [
        {
          kind: 'supply',
          label: 'Fighter starting equipment',
          badgeLabel: 'Fighter starting equipment',
          sourceLabels: [],
        },
      ],
      secondaryTitle: 'Fighter starting equipment',
      disabled: false,
    },
  },
}

export const IncludedQuantity: Story = {
  args: {
    presentation: {
      ...base,
      identity: 'Arrow',
      kindLabel: 'Adventuring Gear',
      metadata: ['Ammunition'],
      trailingState: { label: '×20', accessibleLabel: 'Quantity 20' },
      secondaryClauses: [
        {
          kind: 'supply',
          label: 'Fighter starting equipment',
          badgeLabel: 'Fighter starting equipment',
          sourceLabels: [],
        },
        {
          kind: 'recommendation',
          label: 'Recommended by Guard role',
          badgeLabel: 'Recommended',
          sourceLabels: ['Guard role'],
          discriminator: 'recommended',
        },
      ],
      secondaryTitle: 'Recommended by Guard role · Fighter starting equipment',
      disabled: false,
    },
  },
}
