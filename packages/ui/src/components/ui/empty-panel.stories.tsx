import type { Meta, StoryObj } from '@storybook/react-vite'

import { EmptyPanel } from './empty-panel.client'

const meta = {
  title: 'UI/EmptyPanel',
  component: EmptyPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyPanel>

export default meta
type Story = StoryObj<typeof meta>

export const PassiveMessage: Story = {
  name: 'Passive message',
  args: {
    children: 'No tables added.',
  },
}

export const OnFieldContainer: Story = {
  args: {
    children: 'No grants added.',
  },
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-border-subtle bg-field-container p-4 [--surface-current:var(--field-container)]">
        <Story />
      </div>
    ),
  ],
}

/** @deprecated Story alias — use PassiveMessage */
export const Default = PassiveMessage
