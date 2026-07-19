import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CatalogFilterChips } from './catalog-filter-chips.client'

const levelOptions = [
  { value: '__all__', label: 'All' },
  { value: '1', label: '1st' },
  { value: '2', label: '2nd' },
  { value: '3', label: '3rd' },
] as const

const meta = {
  title: 'Primitives/CatalogFilterChips',
  component: CatalogFilterChips,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogFilterChips>

export default meta
type Story = StoryObj<typeof meta>

export const Multiple: Story = {
  args: {
    id: 'spell-levels',
    label: 'Levels',
    selectionMode: 'multiple',
    options: levelOptions,
    selectedValues: ['__all__'],
    onSelectedValuesChange: () => undefined,
  },
  render: function Render() {
    const [selectedValues, setSelectedValues] = useState<string[]>(['__all__'])

    return (
      <CatalogFilterChips
        id="spell-levels"
        label="Levels"
        selectionMode="multiple"
        options={levelOptions}
        selectedValues={selectedValues}
        onSelectedValuesChange={setSelectedValues}
      />
    )
  },
}

export const SingleRequired: Story = {
  args: {
    id: 'equipment-category',
    label: 'Category',
    selectionMode: 'single-required',
    options: [
      { value: 'all', label: 'All' },
      { value: 'weapon', label: 'Weapon' },
      { value: 'armor', label: 'Armor' },
    ],
    value: 'weapon',
    onValueChange: () => undefined,
  },
  render: function Render() {
    const [value, setValue] = useState('weapon')

    return (
      <CatalogFilterChips
        id="equipment-category"
        label="Category"
        selectionMode="single-required"
        options={[
          { value: 'all', label: 'All' },
          { value: 'weapon', label: 'Weapon' },
          { value: 'armor', label: 'Armor' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
}
