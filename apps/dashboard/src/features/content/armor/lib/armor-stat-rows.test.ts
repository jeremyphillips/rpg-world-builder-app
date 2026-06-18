import { describe, expect, it } from 'vitest'
import type { Armor } from '@rpg/contracts'

import { getArmorStatRows } from './armor-stat-rows'

const LEATHER: Armor = {
  id: 'srd-cc-5.2.1:leather',
  slug: 'leather',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Leather',
  description: '',
  category: 'light',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  material: 'organic',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
}

const PLATE: Armor = {
  id: 'srd-cc-5.2.1:plate',
  slug: 'plate',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Plate',
  description: '',
  category: 'heavy',
  cost: { amount: 1500, currency: 'gp' },
  weight: { value: 65, unit: 'lb' },
  material: 'metal',
  baseAc: 18,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 15,
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
