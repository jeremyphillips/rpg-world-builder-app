import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { FilterToolbar } from './filter-toolbar.client'
import type { FilterFieldConfig } from './filter-toolbar.types'

type DemoFilters = {
  subject: string
  species?: string
  language?: string
}

const DEMO_FIELDS: FilterFieldConfig<DemoFilters>[] = [
  {
    key: 'subject',
    type: 'select',
    label: 'Subject',
    options: [
      { value: 'person', label: 'Person' },
      { value: 'settlement', label: 'Settlement' },
      { value: 'faction', label: 'Faction' },
    ],
    required: true,
  },
  {
    key: 'species',
    type: 'select',
    label: 'Species',
    options: [
      { value: 'elf', label: 'Elf' },
      { value: 'dwarf', label: 'Dwarf' },
      { value: 'dragonborn', label: 'Dragonborn' },
    ],
    allowAny: true,
    placeholder: 'Any species',
  },
  {
    key: 'language',
    type: 'select',
    label: 'Language',
    options: [
      { value: 'elvish', label: 'Elvish' },
      { value: 'dwarvish', label: 'Dwarvish' },
      { value: 'draconic', label: 'Draconic' },
    ],
    allowAny: true,
  },
]

function FilterToolbarDemo({
  initialValues,
  disabled = false,
}: {
  initialValues: DemoFilters
  disabled?: boolean
}) {
  const [values, setValues] = useState(initialValues)

  return (
    <div className="max-w-3xl">
      <FilterToolbar
        idPrefix="demo"
        fields={DEMO_FIELDS}
        values={values}
        disabled={disabled}
        onValueChange={(key, value) => {
          setValues((current) => ({ ...current, [key]: value }))
        }}
        onReset={() => {
          setValues(initialValues)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Components/FilterToolbar',
  component: FilterToolbarDemo,
} satisfies Meta<typeof FilterToolbarDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialValues: { subject: 'person' },
  },
}

export const WithSelections: Story = {
  args: {
    initialValues: { subject: 'person', species: 'elf', language: 'elvish' },
  },
}

export const Disabled: Story = {
  args: {
    initialValues: { subject: 'person', species: 'elf' },
    disabled: true,
  },
}

export const Narrow: Story = {
  args: {
    initialValues: { subject: 'settlement' },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
}
