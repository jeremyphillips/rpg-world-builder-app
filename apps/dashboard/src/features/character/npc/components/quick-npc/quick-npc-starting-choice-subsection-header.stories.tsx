import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuickNpcStartingChoiceSubsectionHeader } from './quick-npc-starting-choice-subsection-header'

const meta = {
  title: 'Features/Character/Quick NPC/Starting choice subsection header',
  component: QuickNpcStartingChoiceSubsectionHeader,
  args: {
    title: 'Additional Equipment',
    description: 'Add specific items this NPC should start with in addition to its package.',
    itemCountLabel: '2 items',
  },
} satisfies Meta<typeof QuickNpcStartingChoiceSubsectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const ItemCount: Story = {}

export const SelectionCounter: Story = {
  args: {
    itemCountLabel: undefined,
    selectionCounter: { selectedCount: 1, max: 2 },
  },
}
