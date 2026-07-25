import type { Meta, StoryObj } from '@storybook/react-vite'

import { CollectionSummaryCell } from './collection-summary-cell.client'

const meta = {
  title: 'Components/CollectionSummaryCell',
  component: CollectionSummaryCell,
  parameters: { layout: 'centered' },
  args: {
    singularLabel: 'subclass',
    pluralLabel: 'subclasses',
  },
} satisfies Meta<typeof CollectionSummaryCell>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    items: [],
  },
}

export const Singular: Story = {
  args: {
    items: [{ id: 'champion', label: 'Champion' }],
  },
}

export const Plural: Story = {
  args: {
    items: [
      { id: 'champion', label: 'Champion' },
      { id: 'battle-master', label: 'Battle Master' },
      { id: 'eldritch-knight', label: 'Eldritch Knight' },
    ],
  },
}

export const Truncated: Story = {
  args: {
    items: [
      { id: 'abjuration', label: 'School of Abjuration' },
      { id: 'evocation', label: 'School of Evocation' },
      { id: 'illusion', label: 'School of Illusion' },
      { id: 'necromancy', label: 'School of Necromancy' },
      { id: 'transmutation', label: 'School of Transmutation' },
      { id: 'enchantment', label: 'School of Enchantment' },
    ],
    maxVisibleItems: 4,
  },
}
