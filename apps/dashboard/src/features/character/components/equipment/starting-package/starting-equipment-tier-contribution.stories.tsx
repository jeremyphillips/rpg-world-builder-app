import type { Meta, StoryObj } from '@storybook/react-vite'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import { RadioCard } from '@rpg/ui'

import { StartingEquipmentTierContribution } from './starting-equipment-tier-contribution'

const heroFunding = {
  classOptionId: 'standard',
  classOptionWealth: { cp: 0, sp: 0, gp: 15, pp: 0 },
  tierAdditionalWealth: { cp: 0, sp: 5, gp: 637, pp: 0 },
  tierLabel: 'Hero',
  bonusGold: {
    baseGp: 500,
    formula: {
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 25,
      currency: 'gp',
    },
  },
  totalStartingWealth: { cp: 0, sp: 5, gp: 652, pp: 0 },
  classOptionPolicy: 'included' as const,
} satisfies StartingEquipmentOptionSummary['funding']

const standardSummary = {
  funding: heroFunding,
} satisfies Pick<StartingEquipmentOptionSummary, 'funding'>

const goldSummary = {
  funding: {
    ...heroFunding,
    classOptionId: 'starting-gold',
    classOptionWealth: { cp: 0, sp: 0, gp: 75, pp: 0 },
    totalStartingWealth: { cp: 0, sp: 5, gp: 712, pp: 0 },
  },
} satisfies Pick<StartingEquipmentOptionSummary, 'funding'>

const meta = {
  title: 'Character Builder/StartingEquipmentTierContribution',
  component: StartingEquipmentTierContribution,
  parameters: { layout: 'padded' },
  args: {
    summary: goldSummary,
  },
} satisfies Meta<typeof StartingEquipmentTierContribution>

export default meta
type Story = StoryObj<typeof meta>

export const HeroTier: Story = {}

export const PackageRadioCards: Story = {
  render: () => (
    <RadioCard
      aria-label="Starting equipment options"
      options={[
        {
          value: 'standard',
          label: 'Standard Equipment',
          description: "Greataxe, 4 Javelins, Explorer's Pack, and 15 GP.",
          summaryContent: <StartingEquipmentTierContribution summary={standardSummary} />,
        },
        {
          value: 'starting-gold',
          label: 'Starting Gold',
          description: 'Take 75 GP instead of standard equipment.',
          summaryContent: <StartingEquipmentTierContribution summary={goldSummary} />,
        },
      ]}
    />
  ),
}
