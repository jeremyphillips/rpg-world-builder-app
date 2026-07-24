import { describe, expect, it } from 'vitest'

import {
  createChipsFilter,
  createEqualsFilter,
  createPopoverFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { stableSerializeFilterState } from './filter-state-serialization'

type Row = {
  name: string
  status: string
  level: number
}

type TestFilterState = {
  search?: string
  status?: 'draft' | 'published'
  levels?: number[]
  mechanics?: Record<string, string[]>
}

const schema = createFilterSchema<Row, TestFilterState>([
  createTextFilter<Row, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<Row, TestFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    defaultValue: 'published',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
  }),
  createChipsFilter<Row, TestFilterState, 'levels'>({
    id: 'levels',
    label: 'Levels',
    selectionMode: 'multiple',
    options: [{ value: '1', label: '1st' }],
    matches: () => true,
  }),
  createPopoverFilter<Row, TestFilterState, 'mechanics'>({
    id: 'mechanics',
    label: 'Mechanics',
    triggerLabel: (count) => `Mechanics (${count})`,
    groups: [
      {
        id: 'traits',
        label: 'Traits',
        options: [{ value: 'concentration', label: 'Concentration' }],
      },
    ],
    matches: () => true,
  }),
])

describe('stableSerializeFilterState', () => {
  it('serializes effective values in schema field order', () => {
    const serialized = stableSerializeFilterState(schema, {
      search: 'fire',
      status: 'draft',
    })

    expect(serialized).toContain('search="fire"')
    expect(serialized).toContain('status="draft"')
    expect(serialized.indexOf('search=')).toBeLessThan(serialized.indexOf('status='))
  })

  it('preserves chip array order', () => {
    const left = stableSerializeFilterState(schema, { levels: [1, 3] })
    const right = stableSerializeFilterState(schema, { levels: [3, 1] })

    expect(left).not.toBe(right)
    expect(left).toContain('levels=[1,3]')
  })

  it('sorts popover group keys while preserving selected value order', () => {
    const left = stableSerializeFilterState(schema, {
      mechanics: { traits: ['concentration'], castingTimes: ['action'] },
    })
    const right = stableSerializeFilterState(schema, {
      mechanics: { castingTimes: ['action'], traits: ['concentration'] },
    })

    expect(left).toBe(right)
    expect(left).toContain('castingTimes:["action"]')
    expect(left).toContain('traits:["concentration"]')
  })

  it('treats equivalent effective values as equal regardless of absent keys', () => {
    const withDefault = stableSerializeFilterState(schema, { status: 'published' })
    const withoutKey = stableSerializeFilterState(schema, {})

    expect(withDefault).toBe(withoutKey)
  })
})
