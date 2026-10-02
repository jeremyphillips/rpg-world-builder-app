import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuickNpcStartingChoiceCategorySummary } from './quick-npc-starting-choice-category-summary'

const meta = {
  title: 'Features/Character/Quick NPC/Starting choice category summary',
  component: QuickNpcStartingChoiceCategorySummary,
  decorators: [
    (Story) => (
      <div className="max-w-md truncate text-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickNpcStartingChoiceCategorySummary>

export default meta
type Story = StoryObj<typeof meta>

export const ShortList: Story = {
  args: {
    labels: ['Perception', 'Athletics'],
  },
}

export const Overflow: Story = {
  args: {
    labels: ['Perception', 'Athletics', 'Insight', 'Survival', 'Stealth'],
  },
}

export const Empty: Story = {
  args: {
    labels: [],
  },
}
