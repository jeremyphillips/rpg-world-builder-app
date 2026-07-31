import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActiveFilterChips } from './active-filter-chips.client'

const meta = {
  title: 'Filters/ActiveFilterChips',
  component: ActiveFilterChips,
} satisfies Meta<typeof ActiveFilterChips>

export default meta

type Story = StoryObj<typeof ActiveFilterChips>

export const Default: Story = {
  args: {
    chips: [
      { fieldId: 'unread', label: 'Unread only', valueLabel: '' },
      { fieldId: 'category', label: 'Type', valueLabel: 'Campaign' },
    ],
    onClear: () => undefined,
    onClearAll: () => undefined,
  },
}
