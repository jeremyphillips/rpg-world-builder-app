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
        <SelectItem value="lg">Lawful Good</SelectItem>
        <SelectItem value="n">Neutral</SelectItem>
        <SelectItem value="ce">Chaotic Evil</SelectItem>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: 'n' } }

export const Disabled: Story = { args: { disabled: true } }
