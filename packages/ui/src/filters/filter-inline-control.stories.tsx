import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Checkbox } from '../components/ui/checkbox.client'
import { FilterInlineControl } from './filter-inline-control.client'

function CheckboxFieldDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <FilterInlineControl>
      <Checkbox
        id="has-spellcasting"
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <label htmlFor="has-spellcasting" className="text-xs font-medium">
        Has Spellcasting
      </label>
    </FilterInlineControl>
  )
}

const meta = {
  title: 'Filters/FilterInlineControl',
  component: FilterInlineControl,
} satisfies Meta<typeof FilterInlineControl>

export default meta

type Story = StoryObj<typeof meta>

export const CheckboxField: Story = {
  render: () => <CheckboxFieldDemo />,
  args: {
    children: null,
  },
}
