import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getServiceStatRows } from './service-stat-rows'

describe('getServiceStatRows', () => {
  it('returns category and duration for skilled hireling', () => {
    const hireling = pickEquipment('skilled-hireling')
    if (hireling.kind !== 'service') throw new Error('expected service')

    const rows = getServiceStatRows(hireling)
    expect(rows).toEqual([
      { label: 'Category', value: 'Hireling' },
      { label: 'Duration', value: 'per day' },
    ])
  })

  it('returns stable category for stabling', () => {
    const stabling = pickEquipment('stabling')
    if (stabling.kind !== 'service') throw new Error('expected service')

    const rows = getServiceStatRows(stabling)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Stable')).toBe(true)
  })
})
