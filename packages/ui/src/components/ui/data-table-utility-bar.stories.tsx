import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataTableUtilityBar } from './data-table-utility-bar.client'

const meta = {
  title: 'Components/DataTableUtilityBar',
  component: DataTableUtilityBar,
} satisfies Meta<typeof DataTableUtilityBar>

export default meta

type Story = StoryObj<typeof meta>

export const SummaryOnly: Story = {
  args: {
    summary: <span>12 results</span>,
  },
}

export const ActionsOnly: Story = {
  args: {
    trailingActions: <button type="button">Columns</button>,
  },
}

export const BrowseAndActions: Story = {
  args: {
    summary: <span>12 results</span>,
    leadingActions: <button type="button">Select</button>,
    trailingActions: <button type="button">Columns</button>,
  },
}
