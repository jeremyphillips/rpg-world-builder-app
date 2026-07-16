import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldReadOnlyValueField } from './field-read-only-value.client'

const meta = {
  title: 'Forms/FieldReadOnlyValue',
  component: FieldReadOnlyValueField,
  args: {
    id: 'amount',
    label: 'Amount',
    displayValue: 'Full effect',
  },
} satisfies Meta<typeof FieldReadOnlyValueField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Labelless: Story = {
  args: {
    label: '',
    displayValue: 'Full effect',
  },
}

export const WithHint: Story = {
  args: {
    hint: 'Only one amount applies to this effect.',
  },
}

export const WithDigits: Story = {
  args: {
    label: '',
    digits: 4,
    displayValue: 'Full effect',
  },
}
