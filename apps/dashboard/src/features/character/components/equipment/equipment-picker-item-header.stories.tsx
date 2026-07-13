import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
} from './equipment-picker-drawer.types'

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

export const StandardGear: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('holy-symbol-amulet')),
    callout: {
      label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
      intent: 'informative',
      importance: 'low',
    },
    commerce: commerceRail('5 GP'),
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-muted/30 p-3">
        <Story />
      </div>
    ),
  ],
}

export const Essential: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('dagger')),
    callout: { label: EQUIPMENT_PICKER_ESSENTIAL_LABEL, intent: 'recommended', importance: 'high' },
    commerce: commerceRail('2 GP'),
  },
}

export const NotProficient: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('plate-armor')),
    callout: {
      label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
      intent: 'caution',
      importance: 'medium',
    },
    commerce: commerceRail('1,500 GP'),
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-muted/30 p-3">
        <Story />
      </div>
    ),
  ],
}

export const CannotAfford: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('plate-armor')),
    callout: {
      label: EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
      intent: 'blocking',
      importance: 'high',
    },
    commerce: commerceRail('1,500 GP'),
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-muted/30 p-3">
        <Story />
      </div>
    ),
  ],
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
    callout: {
      label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
      intent: 'informative',
      importance: 'low',
    },
    commerce: commerceRail('1 GP', { owned: true, stackable: true, ownedQuantity: 2 }),
  },
}

export const WrappedLongName: Story = {
  args: {
    item: {
      ...buildEquipmentPickerRowViewModel(pickEquipment('longsword')),
      name: 'Vorpal Longsword of the Seven Suns and Endless Twilight',
    },
    callout: { label: EQUIPMENT_PICKER_ESSENTIAL_LABEL, intent: 'recommended', importance: 'high' },
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
