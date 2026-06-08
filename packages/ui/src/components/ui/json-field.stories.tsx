import type { Meta, StoryObj } from '@storybook/react-vite'

import { JsonField } from './json-field.client'

const meta = {
  title: 'Forms/JsonField',
  component: JsonField,
  args: {
    id: 'stat-block',
    label: 'Stat block',
    placeholder: '{ }',
  },
} satisfies Meta<typeof JsonField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Validated as JSON when you leave the field.' } }

/** Pass `example` to surface an "Insert example" button that pretty-prints it. */
export const WithExample: Story = {
  args: {
    example: { name: 'Goblin', hp: 7, cr: 0.25 },
  },
}

export const WithError: Story = {
  args: { error: 'This stat block is required.', defaultValue: '' },
}
