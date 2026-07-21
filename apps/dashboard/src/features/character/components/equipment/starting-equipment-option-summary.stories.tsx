import type { Meta, StoryObj } from '@storybook/react-vite'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'

import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary.client'

const goldSummary = {
  optionId: 'starting-gold',
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
  funding: {
    classOptionId: 'starting-gold',
    classOptionWealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
    tierAdditionalWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
    totalStartingWealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
    classOptionPolicy: 'included' as const,
  },
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
      optionId: 'heavy-armor',
      label: 'Heavy Armor',
      description: "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and 4 GP.",
    },
  },
}
