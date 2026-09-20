import type { Meta, StoryObj } from '@storybook/react-vite'

import { ProficiencySelectionCounter } from '../proficiency-selection-counter'

const meta = {
  title: 'Character Builder/ProficiencySelectionCounter',
  component: ProficiencySelectionCounter,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ProficiencySelectionCounter>

export default meta
type Story = StoryObj<typeof ProficiencySelectionCounter>

export const Incomplete: Story = {
  args: {
    selectedCount: 1,
    max: 2,
  },
}

export const Complete: Story = {
  args: {
    selectedCount: 2,
    max: 2,
  },
}
