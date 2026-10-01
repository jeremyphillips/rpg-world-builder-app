import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChoiceSelectionCounter } from './choice-selection-counter.client'
import { CHOICE_SELECTION_COUNTER_DEFAULT_SIZE } from './choice-selection-counter.variants'

const meta = {
  title: 'Primitives/ChoiceSelectionCounter',
  component: ChoiceSelectionCounter,
  parameters: { layout: 'centered' },
  args: {
    selectedCount: 1,
    max: 2,
    size: CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
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

export const CompactIncomplete: Story = {
  args: {
    size: 'sm',
  },
}

export const CompactComplete: Story = {
  args: {
    selectedCount: 2,
    max: 2,
    size: 'sm',
  },
}
