import { fireEvent, render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { FilterToolbar } from './filter-toolbar.client'
import type { FilterFieldConfig } from './filter-toolbar.types'

type TestFilters = {
  subject: string
  species?: string
}

const FIELDS: FilterFieldConfig<TestFilters>[] = [
  {
    key: 'subject',
    type: 'select',
    label: 'Subject',
    options: [
      { value: 'person', label: 'Person' },
      { value: 'settlement', label: 'Settlement' },
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
    ],
    allowAny: true,
    anyLabel: 'Any species',
    visible: true,
  },
]

describe('FilterToolbar', () => {
  it('renders reset and calls onReset', () => {
    const onReset = vi.fn()

    render(
      <FilterToolbar
        idPrefix="test"
        fields={FIELDS}
        values={{ subject: 'person' }}
        onValueChange={() => undefined}
        onReset={onReset}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('hides fields when visible is false', () => {
    const hiddenSpeciesFields: FilterFieldConfig<TestFilters>[] = [
      FIELDS[0]!,
      {
        key: 'species',
        type: 'select',
        label: 'Species',
        options: [{ value: 'elf', label: 'Elf' }],
        visible: false,
      },
    ]

    render(
      <FilterToolbar
        idPrefix="test"
        fields={hiddenSpeciesFields}
        values={{ subject: 'person' }}
        onValueChange={() => undefined}
      />,
    )

    expect(screen.queryByLabelText('Species')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FilterToolbar
        idPrefix="test"
        fields={FIELDS}
        values={{ subject: 'person', species: 'elf' }}
        onValueChange={() => undefined}
        onReset={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
