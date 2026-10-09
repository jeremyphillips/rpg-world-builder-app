import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Checkbox } from '../components/ui/checkbox.client'
import { FilterInlineControl } from './filter-inline-control.client'

function CheckboxFieldDemo({ variant = 'outline' }: { variant?: 'outline' | 'ghost' }) {
  const [checked, setChecked] = useState(false)
  return (
    <FilterInlineControl variant={variant}>
      <Checkbox
        id={`has-spellcasting-${variant}`}
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <label htmlFor={`has-spellcasting-${variant}`} className="text-xs font-medium">
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

export const GhostShell: Story = {
  render: () => <CheckboxFieldDemo variant="ghost" />,
  args: {
    children: null,
  },
}
