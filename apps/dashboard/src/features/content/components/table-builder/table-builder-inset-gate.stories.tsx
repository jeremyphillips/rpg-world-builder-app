import type { Meta, StoryObj } from '@storybook/react-vite'

import { TableBuilderInsetGate } from './table-builder-inset-gate'

const meta = {
  title: 'Content/TableBuilder/TableBuilderInsetGate',
  component: TableBuilderInsetGate,
  parameters: { layout: 'padded' },
  args: {
    headline: 'No columns yet',
    description: 'Add a column to start building this table.',
  },
} satisfies Meta<typeof TableBuilderInsetGate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
