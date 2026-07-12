import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'

const meta = {
  title: 'Character Builder/EquipmentPickerItemHeader',
  component: EquipmentPickerItemHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentPickerItemHeader>

export default meta
type Story = StoryObj<typeof meta>

function commerceRail(
  priceLabel: string,
  options?: { owned?: boolean; stackable?: boolean; ownedQuantity?: number },
) {
  return (
    <EquipmentPickerCommerce
      priceLabel={priceLabel}
      owned={options?.owned ?? false}
      stackable={options?.stackable ?? false}
      ownedQuantity={options?.ownedQuantity ?? 0}
      onAdd={() => undefined}
    />
  )
}

export const Dagger: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('dagger')),
    callout: { label: 'Essential', emphasis: 'info' },
    commerce: commerceRail('2 GP'),
  },
}

export const PlateArmor: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('plate-armor')),
    callout: { label: 'Not proficient', emphasis: 'warning' },
    commerce: commerceRail('1,500 GP'),
  },
}

export const HolySymbol: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('holy-symbol-amulet')),
    callout: { label: 'Standard gear', emphasis: 'info' },
    commerce: commerceRail('5 GP'),
  },
}

export const MagicItem: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('bracers-of-defense')),
    commerce: commerceRail('—'),
  },
}

export const OwnedStackable: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('rope')),
    callout: { label: 'Standard gear', emphasis: 'info' },
    commerce: commerceRail('1 GP', { owned: true, stackable: true, ownedQuantity: 2 }),
  },
}

export const WrappedLongName: Story = {
  args: {
    item: {
      ...buildEquipmentPickerRowViewModel(pickEquipment('longsword')),
      name: 'Vorpal Longsword of the Seven Suns and Endless Twilight',
    },
    callout: { label: 'Essential', emphasis: 'info' },
    commerce: commerceRail('15 GP'),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}
