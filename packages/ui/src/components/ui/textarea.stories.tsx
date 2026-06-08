import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from './textarea.client'

const meta = {
  title: 'Forms/Controls/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Notes',
    placeholder: 'Write something…',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = { args: { size: 'sm' } }

export const Large: Story = { args: { size: 'lg' } }

export const Error: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Oops' },
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read only' } }
