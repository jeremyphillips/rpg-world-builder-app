import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectOptionItem } from './select-option-item.client'
import { Select, SelectContent, SelectTrigger, SelectValue } from './select.client'

const meta = {
  title: 'Forms/Controls/SelectOptionItem',
  component: SelectOptionItem,
  render: () => (
    <Select defaultOpen>
      <SelectTrigger aria-label="Movement mode" className="w-56">
        <SelectValue placeholder="Choose a mode…" />
      </SelectTrigger>
      <SelectContent>
        <SelectOptionItem option={{ label: 'Walk', value: 'walk' }} />
        <SelectOptionItem
          option={{
            label: 'Fly',
            value: 'fly',
            disabled: true,
            disabledReason: 'Already used',
          }}
        />
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof SelectOptionItem>

export default meta
type Story = StoryObj<typeof meta>

export const DisabledWithReason: Story = {
  args: {
    option: {
      label: 'Fly',
      value: 'fly',
      disabled: true,
      disabledReason: 'Already used',
    },
  },
}
