import type { Meta, StoryObj } from '@storybook/react-vite'

import { characterBuilderAbilityRecommendationMessages, formatFieldMessage } from '@rpg/contracts'

import { AutoFillRemainingAction } from './auto-fill-remaining-action.client'

const meta = {
  title: 'Character Builder/AutoFillRemainingAction',
  component: AutoFillRemainingAction,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AutoFillRemainingAction>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: formatFieldMessage(characterBuilderAbilityRecommendationMessages.autoFillRemaining()),
    onAutoFill: () => undefined,
  },
}
