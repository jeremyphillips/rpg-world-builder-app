import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  createEditableGridValue,
  EditableGrid,
  type EditableGridColumn,
  type EditableGridProps,
  type EditableGridValue,
} from './editable-grid.client'

const SPELL_COLUMNS: EditableGridColumn[] = [
  { key: 'cantrips', label: 'Cantrips', control: 'select', min: 1, max: 6 },
  { key: 'spellsAvailable', label: 'Spells prepared', control: 'number', min: 0 },
]

function seededSpellGridValue(): EditableGridValue {
  const value = createEditableGridValue(SPELL_COLUMNS, 20)
  value.cantrips = [4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
  value.spellsAvailable = [
    2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22,
  ]
  return value
}

function EditableGridDemo(props: Omit<EditableGridProps, 'value' | 'onChange'>) {
  const [value, setValue] = useState(() => createEditableGridValue(props.columns, props.rowCount))

  return <EditableGrid {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Forms/EditableGrid',
  component: EditableGridDemo,
  parameters: { layout: 'padded' },
  args: {
    id: 'editable-grid',
    legend: 'Progression table',
    columns: SPELL_COLUMNS,
    rowCount: 10,
  },
} satisfies Meta<typeof EditableGridDemo>

export default meta
type Story = StoryObj<typeof meta>

export const SpellProgression: Story = {
  render: () => {
    const [value, setValue] = useState(seededSpellGridValue)
    return (
      <EditableGrid
        id="spell-progression"
        legend="Spell progression"
        columns={SPELL_COLUMNS}
        rowCount={20}
        value={value}
        onChange={setValue}
        templates={{
          cantrips: [
            {
              name: 'Full caster (4 → 5 → 6)',
              values: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            },
            {
              name: 'Half caster (2 → 3)',
              values: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            },
          ],
        }}
      />
    )
  },
}

export const EmptyGrid: Story = {}

export const WithError: Story = {
  args: {
    error: 'Cantrips known must increase or stay the same at each level.',
  },
}

export const SingleColumn: Story = {
  args: {
    legend: 'Cantrips known',
    columns: [{ key: 'cantrips', label: 'Cantrips', control: 'select', min: 1, max: 6 }],
    rowCount: 8,
    templates: {
      cantrips: [
        {
          name: 'Full caster (4 → 5 → 6)',
          values: [4, 4, 4, 4, 4, 4, 4, 4],
        },
      ],
    },
  },
}

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState(seededSpellGridValue)
    return (
      <EditableGrid
        id="disabled-grid"
        legend="Spell progression"
        columns={SPELL_COLUMNS}
        rowCount={20}
        value={value}
        onChange={setValue}
        disabled
      />
    )
  },
}
