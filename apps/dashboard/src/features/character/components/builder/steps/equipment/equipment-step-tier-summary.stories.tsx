import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { EquipmentStepTierSummary } from './equipment-step-tier-summary'

const startingWealth = getStandardStartingWealthRules(DEFAULT_SYSTEM_RULESET_ID)

const meta = {
  title: 'Character Builder/EquipmentStepTierSummary',
  component: EquipmentStepTierSummary,
  parameters: { layout: 'padded' },
  args: {
    startingWealth,
    startingLevel: 1,
  },
} satisfies Meta<typeof EquipmentStepTierSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Initiate: Story = {}

export const Adventurer: Story = {
  args: { startingLevel: 2 },
}

export const Hero: Story = {
  args: { startingLevel: 5 },
}

export const HeroOpen: Story = {
  args: { startingLevel: 5, defaultOpen: true },
}

export const MultiRarity: Story = {
  args: { startingLevel: 11, defaultOpen: true },
}
