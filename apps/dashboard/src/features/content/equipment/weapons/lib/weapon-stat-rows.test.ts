import { describe, expect, it } from 'vitest'
import { isWeaponEquipment, WEAPON_MASTERY_ENTRIES } from '@rpg/contracts'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getWeaponStatRows } from './weapon-stat-rows'

const LONGSWORD = pickEquipment('longsword')
const SHORTBOW = pickEquipment('shortbow')
if (!isWeaponEquipment(LONGSWORD) || !isWeaponEquipment(SHORTBOW)) {
  throw new Error('Expected weapon fixtures')
}

describe('getWeaponStatRows', () => {
  it('includes melee stats for a versatile weapon', () => {
    const labels = getWeaponStatRows(LONGSWORD).map((row) => row.label)
    expect(labels).toContain('Damage')
    expect(labels).toContain('Versatile')
    expect(labels).not.toContain('Range')
  })

  it('includes range for a ranged weapon', () => {
    const rows = getWeaponStatRows(SHORTBOW)
    expect(rows.find((row) => row.label === 'Range')?.value).toBe('80/320 ft.')
  })

  it('includes mastery description info for tooltip', () => {
    const mastery = getWeaponStatRows(LONGSWORD).find((row) => row.label === 'Mastery')

    expect(mastery?.value).toBe('Sap')
    expect(mastery?.info).toBe(WEAPON_MASTERY_ENTRIES.sap.description)
    expect(mastery?.infoAriaLabel).toBe('About Sap')
  })
})
