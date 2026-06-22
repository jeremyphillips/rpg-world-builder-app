import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailListPanel } from './master-detail-list-panel.client'

const meta = {
  title: 'Content/MasterDetailListPanel',
  component: MasterDetailListPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MasterDetailListPanel>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'a', title: 'Rage', eyebrow: 'Level 1' },
  { id: 'b', title: 'Unarmored Defense', eyebrow: 'Level 1' },
  { id: 'c', title: 'Reckless Attack', eyebrow: 'Level 2' },
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
    onMoveUp: () => {},
    onMoveDown: () => {},
  },
}

export const WithProtectedSystemRow: Story = {
  args: {
    items: [
      {
        id: 'a',
        title: 'Rage',
        eyebrow: 'Level 1',
        badge: { label: 'System', variant: 'secondary' },
        deletable: false,
      },
      { id: 'b', title: 'Custom Fury', eyebrow: 'Level 3' },
    ],
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
