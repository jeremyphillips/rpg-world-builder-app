import type { Meta, StoryObj } from '@storybook/react-vite'

import { DropTargetPrompt } from './drop-target-prompt.client'

const meta = {
  title: 'Primitives/DropTargetPrompt',
  component: DropTargetPrompt,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="relative w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropTargetPrompt>

export default meta

type Story = StoryObj<typeof meta>

export const IdleComfortable: Story = {
  args: {
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5_242_880,
    showBrowse: true,
    onBrowse: () => undefined,
  },
}

export const ActiveInline: Story = {
  args: {
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    multiple: true,
    state: 'active',
    layout: 'inline',
  },
}

/** Modal body overlay — alpha scrim (SSOT for cover active drops). */
export const ActiveCover: Story = {
  render: (args) => (
    <div className="relative h-64 rounded-md border border-border">
      <DropTargetPrompt {...args} />
    </div>
  ),
  args: {
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    multiple: true,
    layout: 'cover',
    state: 'active',
  },
}

export const InvalidCover: Story = {
  render: (args) => (
    <div className="relative h-64 rounded-md border border-border">
      <DropTargetPrompt {...args} />
    </div>
  ),
  args: {
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    multiple: true,
    layout: 'cover',
    state: 'invalid',
  },
}

export const ComfortableIdle: Story = {
  args: {
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    multiple: true,
    density: 'comfortable',
    maxSize: 5_242_880,
    showBrowse: true,
    onBrowse: () => undefined,
    className: 'h-64',
  },
}
