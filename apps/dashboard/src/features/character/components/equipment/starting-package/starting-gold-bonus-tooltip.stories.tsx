import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  StartingGoldBonusFormulaTooltip,
  StartingGoldBonusTooltipBody,
} from './starting-gold-bonus-tooltip'

const meta = {
  title: 'Character Builder/StartingGoldBonusTooltip',
  component: StartingGoldBonusTooltipBody,
  parameters: { layout: 'padded' },
  args: {
    bonusWealth: { cp: 0, sp: 5, gp: 637, pp: 0 },
    bonusGold: {
      baseGp: 500,
      formula: {
        kind: 'dice',
        dice: { count: 1, faces: 10 },
        multiplier: 25,
        currency: 'gp',
      },
    },
  },
} satisfies Meta<typeof StartingGoldBonusTooltipBody>

export default meta
type Story = StoryObj<typeof meta>

export const RadioCard: Story = {}

export const DisclosureFormula: Story = {
  render: (args) => <StartingGoldBonusFormulaTooltip bonusGold={args.bonusGold} />,
}
