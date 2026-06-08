import type { Meta, StoryObj } from '@storybook/react-vite'

import { SwitchField } from './switch-field'

const meta = {
  title: 'Forms/SwitchField',
  component: SwitchField,
  args: {
    id: 'notifications',
    label: 'Email me about session reminders',
  },
} satisfies Meta<typeof SwitchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const WithHint: Story = { args: { hint: 'Sent the day before each session.' } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }
