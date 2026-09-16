import type { Meta, StoryObj } from '@storybook/react-vite'

import { EmptyPanel } from './empty-panel.client'

const meta = {
  title: 'UI/EmptyPanel',
  component: EmptyPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'No tables added.',
  },
}
