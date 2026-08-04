import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content'

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

export const StandardGear: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('holy-symbol-amulet')),
    callout: {
      label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
      intent: 'info',
      importance: 'low',
    },
    summaryTrailingLabel: '5 GP',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-surface-muted p-3">
        <Story />
      </div>
    ),
  ],
}

export const Essential: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('dagger')),
    callout: { label: EQUIPMENT_PICKER_ESSENTIAL_LABEL, intent: 'recommended', importance: 'high' },
    summaryTrailingLabel: '2 GP',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
}

export const NotProficient: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('plate-armor')),
    callout: {
      label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
      intent: 'warning',
      importance: 'medium',
    },
    summaryTrailingLabel: '1,500 GP',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-surface-muted p-3">
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
    summaryTrailingLabel: '1,500 GP',
    summaryTrailingTone: 'muted',
    action: { kind: 'add', disabled: true },
    onAdd: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-surface-muted p-3">
        <Story />
      </div>
    ),
  ],
}

export const MagicItemGrantAvailable: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('potion-of-healing')),
    summaryTrailingLabel: 'Common choice',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
}

export const MagicItemExhaustedPurchasable: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('potion-of-healing')),
    summaryTrailingLabel: '50 GP',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
}

export const MagicItemBlocked: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('bead-of-force')),
    summaryTrailingLabel: 'No Rare choices',
    summaryTrailingTone: 'blocked',
    action: { kind: 'none' },
  },
}

export const MagicItemOwnedAndBlocked: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('bead-of-force')),
    summaryTrailingLabel: 'No Rare choices',
    summaryTrailingTone: 'blocked',
    action: { kind: 'manage_only' },
    ownedQuantity: 1,
  },
}

export const OwnedStackable: Story = {
  args: {
    item: buildEquipmentPickerRowViewModel(pickEquipment('rope')),
    callout: {
      label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
      intent: 'info',
      importance: 'low',
    },
    summaryTrailingLabel: '1 GP',
    action: { kind: 'add', disabled: false },
    ownedQuantity: 2,
    onAdd: () => undefined,
  },
}

export const WrappedLongName: Story = {
  args: {
    item: {
      ...buildEquipmentPickerRowViewModel(pickEquipment('longsword')),
      name: 'Vorpal Longsword of the Seven Suns and Endless Twilight',
    },
    callout: { label: EQUIPMENT_PICKER_ESSENTIAL_LABEL, intent: 'recommended', importance: 'high' },
    summaryTrailingLabel: '15 GP',
    action: { kind: 'add', disabled: false },
    onAdd: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}
