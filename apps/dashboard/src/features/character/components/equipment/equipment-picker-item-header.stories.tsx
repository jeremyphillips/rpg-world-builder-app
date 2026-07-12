import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button, Text } from '@rpg/ui'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'
import { EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL } from './equipment-picker-purchase.lib'

const meta = {
  title: 'Character Builder/EquipmentPickerItemHeader',
  component: EquipmentPickerItemHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentPickerItemHeader>

export default meta
type Story = StoryObj<typeof meta>

function purchaseActions(priceLabel: string, owned?: { quantity: number }) {
  if (owned) {
    return (
      <>
        <Text as="span" variant="muted" className="shrink-0 tabular-nums">
          {priceLabel}
        </Text>
        <Text as="span" variant="muted" className="tabular-nums">
          Owned: {owned.quantity}
        </Text>
        <Button type="button" size="sm" variant="outline">
          {EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL}
        </Button>
      </>
    )
  }

  return (
    <>
      <Text as="span" variant="muted" className="shrink-0 tabular-nums">
        {priceLabel}
      </Text>
      <Button type="button" size="sm" variant="outline">
        Add
      </Button>
    </>
  )
}

export const Dagger: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('dagger')),
    callout: { label: 'Essential', emphasis: 'info' },
    actions: purchaseActions('2 GP'),
  },
}

export const PlateArmor: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('plate-armor')),
    callout: { label: 'Not proficient', emphasis: 'warning' },
    actions: purchaseActions('1,500 GP'),
  },
}

export const HolySymbol: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('holy-symbol-amulet')),
    callout: { label: 'Standard gear', emphasis: 'info' },
    actions: purchaseActions('5 GP'),
  },
}

export const MagicItem: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('bracers-of-defense')),
    actions: purchaseActions('—'),
  },
}

export const OwnedStackable: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('rope')),
    callout: { label: 'Standard gear', emphasis: 'info' },
    actions: purchaseActions('1 GP', { quantity: 2 }),
  },
}

export const WrappedLongName: Story = {
  args: {
    item: {
      ...buildEquipmentPickerRowViewModel(pickEquipment('longsword')),
      name: 'Vorpal Longsword of the Seven Suns and Endless Twilight',
    },
    callout: { label: 'Essential', emphasis: 'info' },
    actions: purchaseActions('15 GP'),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}
