import type { Meta, StoryObj } from '@storybook/react-vite'

import { NumberField } from './number-field'

const meta = {
  title: 'Forms/NumberField',
  component: NumberField,
  args: {
    id: 'count',
    label: 'Count',
    min: 1,
    max: 20,
    defaultValue: 1,
  },
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Between 1 and 20.' } }

export const WithError: Story = { args: { error: 'Must be at least 1.', defaultValue: 0 } }

export const Disabled: Story = { args: { disabled: true } }
