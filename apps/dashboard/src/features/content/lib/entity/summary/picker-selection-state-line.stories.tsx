import type { Meta, StoryObj } from '@storybook/react-vite'

import { PickerSelectionStateLine } from './picker-selection-state-line'

const meta = {
  title: 'Content/Entity/PickerSelectionStateLine',
  component: PickerSelectionStateLine,
  parameters: { layout: 'centered' },
  args: {
    density: 'compact',
    model: { label: 'Owned', provenance: ['Package ×2', 'Purchased'] },
  },
} satisfies Meta<typeof PickerSelectionStateLine>

export default meta
type Story = StoryObj<typeof meta>

export const Owned: Story = {}

export const Selected: Story = {
  args: {
    model: { label: 'Selected' },
  },
}

export const Learned: Story = {
  args: {
    density: 'comfortable',
    model: { label: 'Learned' },
  },
}
