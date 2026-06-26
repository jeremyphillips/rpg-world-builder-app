import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectField } from './select-field'

const options = [
  { label: 'Lawful Good', value: 'lg' },
  { label: 'Neutral', value: 'n' },
  { label: 'Chaotic Evil', value: 'ce' },
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

export const Disabled: Story = { args: { disabled: true, defaultValue: 'n' } }

/** Trigger uses digit tokens; container stays full width so label and hint are not compressed. */
export const WithDigits: Story = {
  args: {
    id: 'spellcasting-level',
    label: 'Spellcasting level',
    hint: 'First class level at which this class gains spellcasting',
    digits: 2,
    defaultValue: '1',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
    ],
  },
}
