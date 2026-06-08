import type { Meta, StoryObj } from '@storybook/react-vite'

import { FormField } from './form-field'
import { Input } from './input.client'

const meta = {
  title: 'Forms/FormField',
  component: FormField,
  args: {
    id: 'email',
    label: 'Email',
    children: <Input id="email" type="email" placeholder="you@example.com" />,
  },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: { hint: 'We never share your email.' },
}

export const WithError: Story = {
  args: {
    error: 'Enter a valid email address.',
    children: <Input id="email" type="email" aria-invalid defaultValue="not-an-email" />,
  },
}
