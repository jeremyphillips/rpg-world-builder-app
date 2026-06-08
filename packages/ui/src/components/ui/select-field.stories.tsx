import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectField } from './select-field'

const options = [
  { label: 'Lawful Good', value: 'lawful-good' },
  { label: 'True Neutral', value: 'true-neutral' },
  { label: 'Chaotic Evil', value: 'chaotic-evil' },
]

const meta = {
  title: 'Forms/SelectField',
  component: SelectField,
  args: {
    id: 'alignment',
    label: 'Alignment',
    placeholder: 'Choose an alignment',
    options,
  },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: { hint: 'You can change this later.' },
}

export const WithError: Story = {
  args: { error: 'Pick an alignment to continue.' },
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'true-neutral' } }
