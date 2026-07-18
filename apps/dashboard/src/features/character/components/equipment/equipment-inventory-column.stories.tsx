import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, InsetPanel } from '@rpg/ui'

import { EquipmentStartingPackageToolbar } from './equipment-starting-package-toolbar.client'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'

const meta = {
  title: 'Character Builder/EquipmentInventoryColumn',
  component: EquipmentInventoryColumn,
  args: {
    title: 'Standard Equipment',
    children: (
      <InsetPanel size="sm" className="rounded-lg">
        <InsetPanel.Text>Column body content</InsetPanel.Text>
      </InsetPanel>
    ),
  },
} satisfies Meta<typeof EquipmentInventoryColumn>

export default meta
type Story = StoryObj<typeof meta>

export const PackageColumn: Story = {
  args: {
    toolbar: (
      <EquipmentStartingPackageToolbar
        customizeDisabled={false}
        onCustomize={() => undefined}
        onChangeEquipmentOption={() => undefined}
      />
    ),
  },
}

export const PurchasedColumn: Story = {
  args: {
    title: 'Purchased Equipment',
    titleActions: <Button size="sm">Browse equipment</Button>,
    reserveToolbarRow: true,
    toolbar: undefined,
  },
}
