import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getVehicleStatRows } from './vehicle-stat-rows'

describe('getVehicleStatRows', () => {
  it('returns category, speed, crew, and combat stats for a rowboat', () => {
    const rowboat = pickEquipment('rowboat')
    if (rowboat.kind !== 'vehicle') throw new Error('expected vehicle')

    const rows = getVehicleStatRows(rowboat)
    expect(rows).toEqual([
      { label: 'Category', value: 'Water' },
      { label: 'Speed', value: '1½ mph' },
      { label: 'Crew', value: '1' },
      { label: 'Passengers', value: '3' },
      { label: 'AC', value: '11' },
      { label: 'HP', value: '50' },
    ])
  })

  it('returns cargo tons and damage threshold for a galley', () => {
    const galley = pickEquipment('galley')
    if (galley.kind !== 'vehicle') throw new Error('expected vehicle')

    const rows = getVehicleStatRows(galley)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Water')).toBe(true)
    expect(rows.some((row) => row.label === 'Cargo' && row.value === '150 tons')).toBe(true)
    expect(rows.some((row) => row.label === 'Damage threshold' && row.value === '20')).toBe(true)
  })
})
