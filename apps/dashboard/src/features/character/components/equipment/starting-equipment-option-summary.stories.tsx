import type { Meta, StoryObj } from '@storybook/react-vite'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'

import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary.client'

const goldSummary = {
  optionId: 'gold',
  label: 'Starting Gold',
  description: 'Take 155 GP instead of standard equipment.',
  orderedItems: [],
  itemsByGroup: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  missingItemSlugs: [],
  unselectableReasons: [],
  isSelectable: true,
} satisfies StartingEquipmentOptionSummary

const meta = {
  title: 'Character Builder/StartingEquipmentOptionSummary',
  component: StartingEquipmentOptionSummaryCard,
  parameters: { layout: 'padded' },
  args: {
    summary: goldSummary,
    onChangePackage: () => undefined,
  },
} satisfies Meta<typeof StartingEquipmentOptionSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const StartingGold: Story = {}

export const HeavyArmorPackage: Story = {
  args: {
    summary: {
      ...goldSummary,
      optionId: 'heavy',
      label: 'Heavy Armor',
      description: "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and 4 GP.",
    },
  },
}
