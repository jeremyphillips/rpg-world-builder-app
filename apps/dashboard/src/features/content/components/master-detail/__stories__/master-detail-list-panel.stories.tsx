import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailListPanel } from '../master-detail-list-panel'

const meta = {
  title: 'Content/MasterDetailListPanel',
  component: MasterDetailListPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MasterDetailListPanel>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'a', title: 'Rage', meta: { eyebrow: 'Level 1', sourceLabel: 'System' } },
  { id: 'b', title: 'Unarmored Defense', meta: { eyebrow: 'Level 1', sourceLabel: 'Homebrew' } },
  { id: 'c', title: 'Reckless Attack', meta: { eyebrow: 'Level 2', sourceLabel: 'Homebrew' } },
]

export const Default: Story = {
  args: {
    items,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet.\nAdd a feature to configure its level, grants, and description.',
    onAdd: () => {},
    onSelect: () => {},
  },
}

export const WithProtectedSystemRow: Story = {
  args: {
    items: [
      {
        id: 'a',
        title: 'Rage',
        meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
        deletable: false,
      },
      {
        id: 'b',
        title: 'Custom Fury',
        meta: { eyebrow: 'Level 3', sourceLabel: 'Homebrew' },
      },
      {
        id: 'c',
        title: 'Legacy Option',
        meta: { eyebrow: 'Level 5', sourceLabel: 'System' },
        active: false,
        deletable: false,
      },
    ],
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet.\nAdd a feature to configure its level, grants, and description.',
    onAdd: () => {},
    onSelect: () => {},
  },
}

export const Empty: Story = {
  args: {
    items: [],
    selectedIndex: null,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet.\nAdd a feature to configure its level, grants, and description.',
    onAdd: () => {},
    onSelect: () => {},
  },
}
