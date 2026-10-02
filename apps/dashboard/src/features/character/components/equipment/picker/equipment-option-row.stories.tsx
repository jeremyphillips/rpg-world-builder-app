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
          label: 'Not proficient',
          badgeLabel: 'Not proficient',
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
      secondaryTitle: 'Required by Wizard class · Not proficient · Recommended by Fighter class',
    },
  },
}

export const IncludedSingleton: Story = {
  args: {
    presentation: {
      ...base,
      trailingState: { label: 'Included', accessibleLabel: 'Included' },
      secondaryClauses: [
        {
          kind: 'supply',
          label: 'Guard role',
          badgeLabel: 'Guard role',
          sourceLabels: [],
        },
      ],
      secondaryTitle: 'Guard role',
      disabled: true,
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
      trailingState: { label: '×20', accessibleLabel: '×20 included' },
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
