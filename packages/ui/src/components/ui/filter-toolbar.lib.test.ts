import { describe, expect, it } from 'vitest'

import { FILTER_TOOLBAR_ANY_VALUE } from './filter-toolbar.variants'
import {
  normalizeFilterToolbarSelectChange,
  resolveFilterToolbarPlaceholder,
  resolveFilterToolbarSelectValue,
} from './filter-toolbar.lib'
import type { SelectFilterFieldConfig } from './filter-toolbar.types'

type TestFilters = {
  subject: string
  species?: string
}

const REQUIRED_FIELD: SelectFilterFieldConfig<TestFilters> = {
  key: 'subject',
  type: 'select',
  label: 'Subject',
  options: [
    { value: 'person', label: 'Person' },
    { value: 'settlement', label: 'Settlement' },
  ],
  required: true,
}

const OPTIONAL_FIELD: SelectFilterFieldConfig<TestFilters> = {
  key: 'species',
  type: 'select',
  label: 'Species',
  options: [
    { value: 'elf', label: 'Elf' },
    { value: 'dwarf', label: 'Dwarf' },
  ],
  allowAny: true,
}

describe('filter-toolbar.lib', () => {
  it('uses the first option for required fields without a value', () => {
    expect(resolveFilterToolbarSelectValue(REQUIRED_FIELD, undefined)).toBe('person')
  })

  it('uses the any sentinel for optional fields without a value', () => {
    expect(resolveFilterToolbarSelectValue(OPTIONAL_FIELD, undefined)).toBe(
      FILTER_TOOLBAR_ANY_VALUE,
    )
  })

  it('normalizes any selection to undefined', () => {
    expect(
      normalizeFilterToolbarSelectChange(OPTIONAL_FIELD, FILTER_TOOLBAR_ANY_VALUE),
    ).toBeUndefined()
  })

  it('resolves placeholder for optional fields', () => {
    expect(resolveFilterToolbarPlaceholder({ allowAny: true, anyLabel: 'Any species' })).toBe(
      'Any species',
    )
    expect(resolveFilterToolbarPlaceholder({ allowAny: true })).toBe('Any')
    expect(resolveFilterToolbarPlaceholder({ placeholder: 'Choose…' })).toBe('Choose…')
  })
})
