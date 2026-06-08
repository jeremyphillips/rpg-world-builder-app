import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextField } from './text-field'

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: {
    id: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@example.com',
  },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    id: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: undefined,
    hint: 'At least 8 characters.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Enter a valid email address.',
    defaultValue: 'not-an-email',
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'you@example.com' },
}
