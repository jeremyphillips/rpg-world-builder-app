import type { Meta, StoryObj } from '@storybook/react-vite'

import { CheckboxField } from './checkbox-field'

const meta = {
  title: 'Forms/CheckboxField',
  component: CheckboxField,
  args: {
    id: 'homebrew',
    label: 'Allow homebrew content',
  },
} satisfies Meta<typeof CheckboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const WithHint: Story = { args: { hint: 'You can change this per campaign.' } }

export const WithError: Story = { args: { error: 'You must accept the rules.' } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }
