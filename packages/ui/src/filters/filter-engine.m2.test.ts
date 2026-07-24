import { describe, expect, it } from 'vitest'

import {
  applyFilterSchema,
  countModifiedFilters,
  createInitialFilterState,
  isFilterConstraining,
  isFilterModified,
  sanitizeFilterState,
  setFilterValue,
} from './filter-engine'
import {
  createChipsFilter,
  createEqualsFilter,
  createPopoverFilter,
  isPopoverFiltersConstraining,
  popoverFiltersEqual,
  shallowArrayEqual,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'

type Row = {
  level: number
  school: string
  castingTime: string
  trait?: string
}

type CatalogFilterState = {
  levels?: number[]
  school?: string
  mechanics?: {
    castingTimes: string[]
    traits: string[]
  }
}

const rows: Row[] = [
  { level: 1, school: 'evocation', castingTime: 'action' },
  { level: 2, school: 'abjuration', castingTime: 'bonus-action', trait: 'concentration' },
  { level: 3, school: 'evocation', castingTime: 'action' },
]

const ALL_SCHOOL = '__all__'

const schema = createFilterSchema<Row, CatalogFilterState>([
  createChipsFilter<Row, CatalogFilterState, 'levels'>({
    id: 'levels',
    label: 'Levels',
    selectionMode: 'multiple',
    allValue: '__all__',
    isValueConstraining: (value) => Array.isArray(value) && value.length > 0,
    isValueEqual: shallowArrayEqual,
    toChipValues: (value) => (!value || value.length === 0 ? ['__all__'] : value.map(String)),
    fromChipValues: (_current, next) => {
      if (next.includes('__all__')) return []
      return next.map(Number).filter((level) => Number.isFinite(level))
    },
    options: [
      { value: '__all__', label: 'All' },
      { value: '1', label: '1st' },
      { value: '2', label: '2nd' },
      { value: '3', label: '3rd' },
    ],
    matches: (row, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.includes(row.level)
    },
  }),
  createEqualsFilter<Row, CatalogFilterState, 'school', string>({
    id: 'school',
    label: 'School',
    defaultValue: ALL_SCHOOL,
    options: [
      { value: ALL_SCHOOL, label: 'All' },
      { value: 'evocation', label: 'Evocation' },
      { value: 'abjuration', label: 'Abjuration' },
    ],
    getValue: (row) => row.school,
    isValueConstraining: (value) => value !== ALL_SCHOOL,
    showAllOption: false,
  }),
  createPopoverFilter<Row, CatalogFilterState, 'mechanics'>({
    id: 'mechanics',
    label: 'Mechanics',
    triggerLabel: (count) => (count === 0 ? 'Mechanics' : `Mechanics · ${count}`),
    defaultValue: { castingTimes: [], traits: [] },
    groups: [
      {
        id: 'castingTimes',
        label: 'Casting time',
        options: [
          { value: 'action', label: 'Action' },
          { value: 'bonus-action', label: 'Bonus action' },
        ],
      },
      {
        id: 'traits',
        label: 'Traits',
        options: [{ value: 'concentration', label: 'Concentration' }],
      },
    ],
    matches: (row, value) => {
      const filters = value as CatalogFilterState['mechanics']
      if (!filters) return true
      const castingMatch =
        filters.castingTimes.length === 0 || filters.castingTimes.includes(row.castingTime)
      const traitMatch =
        filters.traits.length === 0 || (row.trait ? filters.traits.includes(row.trait) : false)
      return castingMatch && traitMatch
    },
  }),
])

describe('filter-engine M2 field types', () => {
  it('treats empty chip arrays as unconstrained', () => {
    const state = createInitialFilterState(schema)
    expect(isFilterConstraining(schema, state, 'levels')).toBe(false)
    expect(applyFilterSchema(schema, state, rows)).toEqual(rows)
  })

  it('filters rows by chip selections', () => {
    const state = { levels: [1, 3] }
    expect(applyFilterSchema(schema, state, rows)).toEqual([rows[0], rows[2]])
  })

  it('filters rows by popover mechanics groups', () => {
    const state = {
      mechanics: { castingTimes: ['bonus-action'], traits: [] },
    }
    expect(applyFilterSchema(schema, state, rows)).toEqual([rows[1]])
  })

  it('counts popover active filters via isPopoverFiltersConstraining', () => {
    expect(isPopoverFiltersConstraining({ castingTimes: [], traits: [] })).toBe(false)
    expect(isPopoverFiltersConstraining({ castingTimes: ['action'], traits: [] })).toBe(true)
  })

  it('compares popover state with popoverFiltersEqual', () => {
    expect(
      popoverFiltersEqual(
        { castingTimes: ['action'], traits: [] },
        { castingTimes: ['action'], traits: [] },
      ),
    ).toBe(true)
    expect(
      popoverFiltersEqual(
        { castingTimes: ['action'], traits: [] },
        { castingTimes: [], traits: [] },
      ),
    ).toBe(false)
  })

  it('counts modified structured filters', () => {
    const state = {
      levels: [1],
      school: ALL_SCHOOL,
      mechanics: { castingTimes: ['action'], traits: [] },
    }
    expect(countModifiedFilters(schema, state)).toBe(2)
    expect(isFilterModified(schema, state, 'school')).toBe(false)
  })
})

describe('sanitizeState and normalizeChange', () => {
  const schemaWithHooks = createFilterSchema<Row, CatalogFilterState>(schema.fields, {
    sanitizeState: (state) => ({
      levels: Array.isArray(state.levels)
        ? state.levels.filter((level) => level >= 1 && level <= 3)
        : state.levels,
    }),
    normalizeChange: (next, context) => {
      if (context.changedId !== 'school') return next
      if (next.school === 'abjuration') {
        return { ...next, levels: [2] }
      }
      return next
    },
  })

  it('sanitizes invalid values on hydrate', () => {
    expect(sanitizeFilterState(schemaWithHooks, { levels: [1, 99] })).toEqual({
      levels: [1],
      school: ALL_SCHOOL,
      mechanics: { castingTimes: [], traits: [] },
    })
  })

  it('runs normalizeChange once after setValue', () => {
    const next = setFilterValue(schemaWithHooks, {}, 'school', 'abjuration')
    expect(next).toEqual({ school: 'abjuration', levels: [2] })
  })
})
