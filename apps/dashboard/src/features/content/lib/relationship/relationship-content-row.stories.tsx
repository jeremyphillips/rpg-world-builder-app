import type { Meta, StoryObj } from '@storybook/react-vite'

import { RelationshipContentRow } from './relationship-content-row.client'

const meta = {
  title: 'Content/Relationship/RelationshipContentRow',
  component: RelationshipContentRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RelationshipContentRow>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyWithAdd: Story = {
  args: {
    emptyLabel: 'No people or organizations linked.',
    addLabel: 'Add relationship',
    onAdd: () => undefined,
  },
}

export const EmptyOnly: Story = {
  args: {
    emptyLabel: 'No governing organization.',
  },
}

export const PopulatedTrailingAdd: Story = {
  args: {
    addLabel: 'Add relationship',
    onAdd: () => undefined,
  },
}
