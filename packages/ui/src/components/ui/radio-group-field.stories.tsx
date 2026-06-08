import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioGroupField } from './radio-group-field'

const options = [
  { label: 'Easy', value: 'easy' },
  { label: 'Normal', value: 'normal' },
  { label: 'Deadly', value: 'deadly' },
]

const meta = {
  title: 'Forms/RadioGroupField',
  component: RadioGroupField,
  args: {
    id: 'difficulty',
    label: 'Encounter difficulty',
    options,
  },
} satisfies Meta<typeof RadioGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: 'normal' } }

export const WithError: Story = { args: { error: 'Choose a difficulty.' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'normal' } }
