import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChoiceSelectionCounter } from './choice-selection-counter.client'

const meta = {
  title: 'Primitives/ChoiceSelectionCounter',
  component: ChoiceSelectionCounter,
  parameters: { layout: 'centered' },
  args: {
    selectedCount: 1,
    max: 2,
  },
} satisfies Meta<typeof ChoiceSelectionCounter>

export default meta
type Story = StoryObj<typeof meta>

export const Incomplete: Story = {}

export const Complete: Story = {
  args: {
    selectedCount: 2,
    max: 2,
  },
}
