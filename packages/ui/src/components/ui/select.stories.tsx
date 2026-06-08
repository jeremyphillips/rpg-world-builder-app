import type { Meta, StoryObj } from '@storybook/react-vite'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'

const meta = {
  title: 'Forms/Controls/Select',
  component: Select,
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Alignment" className="w-48">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lawful-good">Lawful Good</SelectItem>
        <SelectItem value="true-neutral">True Neutral</SelectItem>
        <SelectItem value="chaotic-evil">Chaotic Evil</SelectItem>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: 'true-neutral' } }

export const Disabled: Story = { args: { disabled: true } }
