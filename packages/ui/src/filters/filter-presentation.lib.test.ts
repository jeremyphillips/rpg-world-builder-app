import { describe, expect, it } from 'vitest'

import {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import {
  resolveFilterControlSize,
  resolveFilterFieldPresentation,
  resolveFilterFieldWidthClasses,
} from './filter-presentation.lib'
import type { FilterFieldDef } from './filter-schema.types'

type Row = { name: string; status: string }

type TestState = {
  search?: string
  status?: string
  statusInline?: string
  hiddenOnly?: boolean
  levels?: number[]
}

const schema = createFilterSchema<Row, TestState>([
  createTextFilter<Row, TestState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<Row, TestState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    layout: 'stacked',
    width: 'md',
    options: [{ value: 'draft', label: 'Draft' }],
    getValue: (row) => row.status as 'draft' | 'published',
  }),
  createEqualsFilter<Row, TestState, 'statusInline', 'draft' | 'published'>({
    id: 'statusInline',
    label: 'Status inline',
    layout: 'inline',
    options: [{ value: 'draft', label: 'Draft' }],
    getValue: (row) => row.status as 'draft' | 'published',
  }),
  createBooleanFilter<Row, TestState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
    getValue: () => false,
  }),
  createChipsFilter<Row, TestState, 'levels'>({
    id: 'levels',
    label: 'Levels',
    selectionMode: 'multiple',
    options: [{ value: '1', label: '1st' }],
    matches: () => true,
  }),
])

function fieldAt(index: number): FilterFieldDef<Row, TestState> {
  return schema.fields[index]!
}

describe('filter-presentation.lib', () => {
  const compactChrome = { density: 'compact' as const }
  const comfortableChrome = { density: 'comfortable' as const }

  it('maps compact density to sm control, chip, and trigger sizes', () => {
    const textField = fieldAt(0)
    const selectField = fieldAt(1)
    const chipsField = fieldAt(4)

    expect(resolveFilterFieldPresentation(textField, compactChrome).type).toBe('text')
    expect(resolveFilterFieldPresentation(textField, compactChrome)).toMatchObject({
      controlSize: 'sm',
    })
    expect(resolveFilterFieldPresentation(selectField, compactChrome)).toMatchObject({
      controlSize: 'sm',
    })
    expect(resolveFilterFieldPresentation(chipsField, compactChrome)).toMatchObject({
      chipSize: 'sm',
      shellClassName: 'gap-1',
    })
  })

  it('maps comfortable density to md control, chip, and trigger sizes', () => {
    const textField = fieldAt(0)
    const selectField = fieldAt(1)
    const chipsField = fieldAt(4)

    expect(resolveFilterFieldPresentation(textField, comfortableChrome)).toMatchObject({
      controlSize: 'md',
    })
    expect(resolveFilterFieldPresentation(selectField, comfortableChrome)).toMatchObject({
      controlSize: 'md',
    })
    expect(resolveFilterFieldPresentation(chipsField, comfortableChrome)).toMatchObject({
      chipSize: 'md',
      shellClassName: 'gap-2',
    })
  })

  it('uses stacked group classes for stacked select layout', () => {
    const stackedSelect = fieldAt(1)
    const presentation = resolveFilterFieldPresentation(stackedSelect, compactChrome)

    expect(presentation.type).toBe('select')
    if (presentation.type === 'select') {
      expect(presentation.groupClassName).toContain('flex-col')
      expect(presentation.labelClassName).toContain('text-xs')
    }
  })

  it('uses inline group classes for inline select layout', () => {
    const inlineSelect = fieldAt(2)
    const presentation = resolveFilterFieldPresentation(inlineSelect, compactChrome)

    expect(presentation.type).toBe('select')
    if (presentation.type === 'select') {
      expect(presentation.groupClassName).toContain('sm:flex-row')
    }
  })

  it('resolves width classes independently of density', () => {
    expect(resolveFilterFieldWidthClasses('md')).toBeTruthy()
    expect(resolveFilterFieldWidthClasses('md')).toBe(resolveFilterFieldWidthClasses('md'))
    expect(resolveFilterFieldWidthClasses(undefined)).toBeUndefined()
  })

  it('exposes resolveFilterControlSize for compact and comfortable', () => {
    expect(resolveFilterControlSize('compact')).toBe('sm')
    expect(resolveFilterControlSize('comfortable')).toBe('md')
  })
})
