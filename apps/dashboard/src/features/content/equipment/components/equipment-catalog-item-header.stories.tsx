import type { Meta, StoryObj } from '@storybook/react-vite'

import { EquipmentCatalogItemHeader } from './equipment-catalog-item-header.client'

const meta = {
  title: 'Content/Equipment/EquipmentCatalogItemHeader',
  component: EquipmentCatalogItemHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentCatalogItemHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Dagger',
    metadataLines: [{ segments: [{ type: 'text', text: '1d4 Piercing' }] }],
    footer: <span className="text-sm text-muted-foreground">Weapon</span>,
    actions: <button type="button">Add</button>,
  },
}

export const Unavailable: Story = {
  args: {
    name: 'Missing gear',
    tone: 'unavailable',
    footer: <span className="text-sm text-muted-foreground">Equipment reference unavailable</span>,
  },
}
