import { describe, expect, it } from 'vitest'

import { createInitialFilterState } from './filter-engine'
import { createBooleanFilter, createEqualsFilter } from './filter-engine.helpers'
import { resolveActiveFilterChips } from './filter-active-chips.lib'
import { createFilterSchema } from './filter-schema.types'

type DemoRow = { status: string; hidden: boolean }

type DemoState = {
  unread?: boolean
  status?: 'draft' | 'published'
}

const schema = createFilterSchema<DemoRow, DemoState>([
  createBooleanFilter<DemoRow, DemoState, 'unread'>({
    id: 'unread',
    label: 'Unread only',
    placement: 'primary',
    getValue: (row) => !row.hidden,
  }),
  createEqualsFilter<DemoRow, DemoState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
    showAllOption: true,
  }),
])

describe('resolveActiveFilterChips', () => {
  it('returns chips only for modified fields with natural boolean copy', () => {
    const state = { ...createInitialFilterState(schema), unread: true }

    expect(resolveActiveFilterChips(schema, state)).toEqual([
      { fieldId: 'unread', label: 'Unread only', valueLabel: '' },
    ])
  })

  it('includes select value labels from option metadata', () => {
    const state: DemoState = { ...createInitialFilterState(schema), status: 'draft' }

    expect(resolveActiveFilterChips(schema, state)).toEqual([
      { fieldId: 'status', label: 'Status', valueLabel: 'Draft' },
    ])
  })

  it('honors activeChip.include=false', () => {
    const omitSchema = createFilterSchema<DemoRow, DemoState>([
      createEqualsFilter<DemoRow, DemoState, 'status', 'draft' | 'published'>({
        id: 'status',
        label: 'Status',
        options: [{ value: 'draft', label: 'Draft' }],
        getValue: (row) => row.status as 'draft' | 'published',
        activeChip: { include: false },
      }),
    ])

    expect(
      resolveActiveFilterChips(omitSchema, {
        ...createInitialFilterState(omitSchema),
        status: 'draft',
      } satisfies DemoState),
    ).toEqual([])
  })
})
