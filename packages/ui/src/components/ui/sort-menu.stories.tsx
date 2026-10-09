import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SortMenu, sortMenuFlatSections } from './sort-menu.client'

const sections = sortMenuFlatSections([
  { value: 'best_match', label: 'Best match', triggerLabel: 'Best match' },
  { value: 'name_asc', label: 'Name: A–Z', triggerLabel: 'A–Z' },
  { value: 'name_desc', label: 'Name: Z–A', triggerLabel: 'Z–A' },
])

function SortMenuDemo() {
  const [value, setValue] = useState('best_match')
  return <SortMenu value={value} sections={sections} onValueChange={setValue} />
}

const meta = {
  title: 'UI/SortMenu',
  component: SortMenuDemo,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SortMenuDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
