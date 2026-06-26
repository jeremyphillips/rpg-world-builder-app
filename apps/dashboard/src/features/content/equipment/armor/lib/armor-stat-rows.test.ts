import { describe, expect, it } from 'vitest'
import { isArmorEquipment } from '@rpg/contracts'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getArmorStatRows } from './armor-stat-rows'

const LEATHER = pickEquipment('leather-armor')
const PLATE = pickEquipment('plate-armor')
if (!isArmorEquipment(LEATHER) || !isArmorEquipment(PLATE)) {
  throw new Error('Expected armor fixtures')
}

describe('getArmorStatRows', () => {
  it('omits optional rows for light armor', () => {
    const labels = getArmorStatRows(LEATHER).map((row) => row.label)
    expect(labels).not.toContain('Max Dex Bonus')
    expect(labels).not.toContain('Strength Required')
  })

  it('includes strength requirement for heavy armor', () => {
    const rows = getArmorStatRows(PLATE)
    expect(rows.find((row) => row.label === 'Strength Required')?.value).toBe('15')
    expect(rows.find((row) => row.label === 'Stealth')?.value).toBe('Disadvantage')
  })
})
