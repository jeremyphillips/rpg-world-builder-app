import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextareaField } from './textarea-field'

const meta = {
  title: 'Forms/TextareaField',
  component: TextareaField,
  args: {
    id: 'bio',
    label: 'Biography',
    placeholder: 'A short backstory…',
  },
} satisfies Meta<typeof TextareaField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Markdown is not supported here.' } }

export const WithError: Story = {
  args: { error: 'Backstory is required.', defaultValue: '' },
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked.' } }
