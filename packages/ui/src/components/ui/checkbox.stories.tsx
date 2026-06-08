import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from './checkbox.client'

const meta = {
  title: 'Forms/Controls/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Accept terms' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Error: Story = { args: { 'aria-invalid': true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }
