import { describe, expect, it } from 'vitest'

import { comparePickerName } from './compare-picker-name'

describe('comparePickerName', () => {
  it('orders by name with base sensitivity and numeric collation', () => {
    const rows = [
      { id: '10', name: 'Hall 10' },
      { id: 'zeta', name: 'zeta hall' },
      { id: '2', name: 'Hall 2' },
      { id: 'amber', name: 'Amber Hall' },
    ]

    expect(rows.toSorted(comparePickerName).map((row) => row.name)).toEqual([
      'Amber Hall',
      'Hall 2',
      'Hall 10',
      'zeta hall',
    ])
  })

  it('breaks equal names on stable id', () => {
    const rows = [
      { id: 'loc-b', name: 'Amber Hall' },
      { id: 'loc-a', name: 'Amber Hall' },
    ]

    expect(rows.toSorted(comparePickerName).map((row) => row.id)).toEqual(['loc-a', 'loc-b'])
  })

  it('leaves equal names unordered when either row has no stable id', () => {
    expect(comparePickerName({ name: 'Amber Hall', id: 'loc-a' }, { name: 'Amber Hall' })).toBe(0)
    expect(comparePickerName({ name: 'Amber Hall' }, { name: 'Amber Hall', id: 'loc-b' })).toBe(0)
    expect(
      comparePickerName({ name: 'Amber Hall', id: '' }, { name: 'Amber Hall', id: 'loc-b' }),
    ).toBe(0)
  })
})
