import { describe, expect, it } from 'vitest'

import { disableOptionsUsedInSiblingRows } from './array-unique-select.lib'

const options = [
  { value: 'walk', label: 'Walk' },
  { value: 'fly', label: 'Fly' },
  { value: 'swim', label: 'Swim' },
  { value: 'climb', label: 'Climb' },
]

type Row = { mode: string }

function filterModeAt(items: Row[], rowIndex: number) {
  return disableOptionsUsedInSiblingRows({ fieldName: 'mode' })({
    arrayItems: items,
    rowIndex,
    fieldName: 'mode',
    options,
    watchedValues: {},
  })
}

function optionState(result: ReturnType<typeof filterModeAt>, value: string) {
  return result.find((option) => option.value === value)
}

describe('disableOptionsUsedInSiblingRows', () => {
  const filter = disableOptionsUsedInSiblingRows({ fieldName: 'mode' })

  it('disables modes used in sibling rows', () => {
    const result = filter({
      arrayItems: [{ mode: 'walk' }, { mode: '' }],
      rowIndex: 1,
      fieldName: 'mode',
      options,
      watchedValues: {},
    })

    expect(optionState(result, 'walk')).toMatchObject({
      disabled: true,
      disabledReason: 'Already used',
    })
    expect(optionState(result, 'fly')?.disabled).toBe(false)
  })

  it('keeps the current row selection enabled even when duplicated elsewhere', () => {
    const result = filter({
      arrayItems: [{ mode: 'walk' }, { mode: 'walk' }],
      rowIndex: 0,
      fieldName: 'mode',
      options,
      watchedValues: {},
    })

    expect(optionState(result, 'walk')).toMatchObject({ disabled: false })
    expect(optionState(result, 'walk')?.disabled).toBe(false)
  })

  it('preserves upstream disabled options and custom reasons', () => {
    const restricted = [
      { value: 'walk', label: 'Walk', disabled: true, disabledReason: 'Unavailable in campaign.' },
      ...options.slice(1),
    ]

    const result = filter({
      arrayItems: [{ mode: 'fly' }, { mode: '' }],
      rowIndex: 1,
      fieldName: 'mode',
      options: restricted,
      watchedValues: {},
    })

    expect(optionState(result, 'walk')).toMatchObject({
      disabled: true,
      disabledReason: 'Unavailable in campaign.',
    })
    expect(optionState(result, 'fly')).toMatchObject({
      disabled: true,
      disabledReason: 'Already used',
    })
  })

  it('ignores unrelated field names', () => {
    const result = filter({
      arrayItems: [{ mode: 'walk' }],
      rowIndex: 0,
      fieldName: 'feet',
      options,
      watchedValues: {},
    })

    expect(result.every((option) => !option.disabled)).toBe(true)
  })

  describe('transition cases', () => {
    it('Walk + Fly — Fly row disables Walk', () => {
      const items: Row[] = [{ mode: 'walk' }, { mode: 'fly' }]
      expect(optionState(filterModeAt(items, 1), 'walk')).toMatchObject({ disabled: true })
      expect(optionState(filterModeAt(items, 1), 'fly')?.disabled).toBe(false)
    })

    it('change Walk → Swim — Walk becomes available elsewhere and Swim is disabled elsewhere', () => {
      const items: Row[] = [{ mode: 'swim' }, { mode: 'fly' }]

      expect(optionState(filterModeAt(items, 1), 'walk')?.disabled).toBe(false)
      expect(optionState(filterModeAt(items, 1), 'swim')).toMatchObject({ disabled: true })
      expect(optionState(filterModeAt(items, 0), 'fly')).toMatchObject({ disabled: true })
      expect(optionState(filterModeAt(items, 0), 'swim')?.disabled).toBe(false)
    })

    it('delete Swim row — Swim becomes available again', () => {
      const items: Row[] = [{ mode: 'walk' }, { mode: 'fly' }]
      expect(optionState(filterModeAt(items, 1), 'swim')?.disabled).toBe(false)
    })

    it('legacy duplicate Walk + Walk — both current Walk values stay enabled in their rows', () => {
      const items: Row[] = [{ mode: 'walk' }, { mode: 'walk' }]

      expect(optionState(filterModeAt(items, 0), 'walk')?.disabled).toBe(false)
      expect(optionState(filterModeAt(items, 1), 'walk')?.disabled).toBe(false)
    })

    it('add empty row — unused modes remain selectable in that row', () => {
      const items: Row[] = [{ mode: 'walk' }, { mode: '' }]

      expect(optionState(filterModeAt(items, 1), 'walk')).toMatchObject({ disabled: true })
      expect(optionState(filterModeAt(items, 1), 'fly')?.disabled).toBe(false)
      expect(optionState(filterModeAt(items, 1), 'swim')?.disabled).toBe(false)
    })
  })
})
