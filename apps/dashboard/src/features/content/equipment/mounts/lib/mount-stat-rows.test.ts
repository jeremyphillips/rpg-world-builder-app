import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getMountStatRows } from './mount-stat-rows'

describe('getMountStatRows', () => {
  it('returns carrying capacity and speed for a riding horse', () => {
    const horse = pickEquipment('riding-horse')
    if (horse.kind !== 'mount') throw new Error('expected mount')

    const rows = getMountStatRows(horse)
    expect(rows).toEqual([
      { label: 'Carrying capacity', value: '480 lb' },
      { label: 'Speed', value: '60 ft.' },
    ])
  })

  it('returns carrying capacity for a mule without speed when absent', () => {
    const mule = pickEquipment('mule')
    if (mule.kind !== 'mount') throw new Error('expected mount')

    const rows = getMountStatRows(mule)
    expect(rows.some((row) => row.label === 'Carrying capacity' && row.value === '420 lb')).toBe(
      true,
    )
    expect(rows.some((row) => row.label === 'Speed' && row.value === '40 ft.')).toBe(true)
  })
})
