import type { Meta, StoryObj } from '@storybook/react-vite'

import type { EquipmentMagicItemSlot } from '@rpg/contracts'

import { EquipmentResourceSummary } from './equipment-resource-summary'

const currency = {
  heading: '74 GP 6 SP remaining',
  subheading: '75 GP budget · 4 SP spent',
}

const slots: EquipmentMagicItemSlot[] = [
  {
    rarity: 'common',
    rarityMode: 'exact',
    quantity: 2,
    remaining: 2,
    fulfilled: false,
  },
  {
    rarity: 'uncommon',
    rarityMode: 'maximum',
    quantity: 1,
    remaining: 0,
    fulfilled: true,
  },
]

const meta = {
  title: 'Character Builder/EquipmentResourceSummary',
  component: EquipmentResourceSummary,
  parameters: { layout: 'padded' },
  args: {
    density: 'comfortable',
    currency,
    slots,
    currencyAction: { label: 'Browse equipment', variant: 'secondary', onClick: () => undefined },
    magicItemsAction: {
      label: 'Browse magic items',
      variant: 'secondary',
      onClick: () => undefined,
    },
  },
} satisfies Meta<typeof EquipmentResourceSummary>

export default meta
type Story = StoryObj<typeof meta>

export const CurrencyAndMagicItems: Story = {}

export const CurrencyOnly: Story = {
  args: { slots: undefined, magicItemsAction: undefined },
}

export const MagicItemsOnly: Story = {
  args: {
    currency: undefined,
    currencyAction: undefined,
  },
}

export const FulfilledSlots: Story = {
  args: {
    currency: undefined,
    currencyAction: undefined,
    magicItemsAction: {
      label: 'Manage magic items',
      variant: 'outline',
      onClick: () => undefined,
    },
    slots: [
      {
        rarity: 'common',
        rarityMode: 'exact',
        quantity: 1,
        remaining: 0,
        fulfilled: true,
      },
    ],
  },
}

export const CompactDrawer: Story = {
  args: {
    density: 'compact',
    slots: undefined,
    currencyAction: undefined,
    magicItemsAction: undefined,
    currency: { heading: '40 GP remaining', subheading: '100 GP budget · 15 GP spent' },
  },
}
