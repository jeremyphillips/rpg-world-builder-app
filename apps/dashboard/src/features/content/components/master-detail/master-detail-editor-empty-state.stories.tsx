import type { Meta, StoryObj } from '@storybook/react-vite'

import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'

const itemNoun = defineMasterDetailItemNoun({
  label: 'Trait',
  singular: 'trait',
  plural: 'traits',
})

const meta = {
  title: 'Content/MasterDetail/MasterDetailEditorEmptyState',
  component: MasterDetailEditorEmptyState,
  parameters: { layout: 'padded' },
  args: {
    itemNoun,
  },
} satisfies Meta<typeof MasterDetailEditorEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
