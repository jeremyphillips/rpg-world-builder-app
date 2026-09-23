import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { MediaFieldSummary } from './media-field-summary.client'

const meta = {
  title: 'Components/MediaFieldSummary',
  component: MediaFieldSummary,
  args: { label: 'Images', maxItems: 20, onOpen: fn() },
} satisfies Meta<typeof MediaFieldSummary>
export default meta
type Story = StoryObj<typeof meta>

export const CompactEmpty: Story = { args: { layout: 'compact', items: [] } }
export const CompactPopulated: Story = {
  args: { layout: 'compact', items: [{ id: 'one' }, { id: 'two' }] },
}
export const ExpandedEmpty: Story = { args: { layout: 'expanded', items: [] } }
export const ExpandedOverflow: Story = {
  args: {
    layout: 'expanded',
    items: Array.from({ length: 7 }, (_, index) => ({ id: `image-${index}` })),
  },
}
export const ReadOnly: Story = {
  args: { layout: 'expanded', readOnly: true, items: [{ id: 'one' }] },
}
