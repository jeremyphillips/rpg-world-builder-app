import type { Meta, StoryObj } from '@storybook/react-vite'

import { EquipmentResourceSummary } from './equipment-resource-summary'

const meta = {
  title: 'Character Builder/EquipmentResourceSummary',
  component: EquipmentResourceSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical density and composition variants live in dashboard Storybook **Recipes / Cards and Rows** (equipment acquisition resource panel).',
      },
    },
  },
  args: {
    density: 'comfortable',
    currency: {
      heading: '74 GP 6 SP remaining',
      metadata: ['75 GP budget', '4 SP spent'],
    },
    slots: [
      {
        rarity: 'common',
        rarityMode: 'exact',
        quantity: 2,
        remaining: 2,
        fulfilled: false,
      },
    ],
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

export const Default: Story = {}
