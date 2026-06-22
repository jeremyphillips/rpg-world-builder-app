import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailListPanel } from './master-detail-list-panel.client'

const meta = {
  title: 'Content/Classes/MasterDetailListPanel',
  component: MasterDetailListPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MasterDetailListPanel>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'a', title: 'Rage' },
  { id: 'b', title: 'Unarmored Defense' },
  { id: 'c', title: 'Reckless Attack' },
]

export const Default: Story = {
  args: {
    items,
    selectedIndex: 0,
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet. Add one to get started.',
    onAdd: () => {},
    onSelect: () => {},
    onRemove: () => {},
  },
}

export const Empty: Story = {
  args: {
    items: [],
    selectedIndex: null,
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet. Add one to get started.',
    onAdd: () => {},
    onSelect: () => {},
    onRemove: () => {},
  },
}
