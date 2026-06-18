import { describe, expect, it } from 'vitest'
import type { Weapon } from '@rpg/contracts'

import { getWeaponStatRows } from './weapon-stat-rows'

const LONGSWORD: Weapon = {
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  category: 'martial',
  mode: 'melee',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  damage: { kind: 'dice', count: 1, faces: 8 },
  damageType: 'slashing',
  versatileDamage: { kind: 'dice', count: 1, faces: 10 },
  properties: ['versatile'],
  mastery: 'sap',
}

const SHORTBOW: Weapon = {
  id: 'srd-cc-5.2.1:shortbow',
  slug: 'shortbow',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Shortbow',
  description: '',
  category: 'simple',
  mode: 'ranged',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  damage: { kind: 'dice', count: 1, faces: 6 },
  damageType: 'piercing',
  properties: ['ammunition', 'two-handed'],
  mastery: 'vex',
  range: { normal: 80, long: 320 },
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
})
