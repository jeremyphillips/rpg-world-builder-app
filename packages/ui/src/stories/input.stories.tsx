import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '../components/ui/input'

const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    placeholder: 'you@example.com',
    'aria-label': 'Email',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: { type: 'email', placeholder: 'you@example.com', 'aria-label': 'Email' },
}

export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••', 'aria-label': 'Password' },
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled', 'aria-label': 'Disabled field' },
}
