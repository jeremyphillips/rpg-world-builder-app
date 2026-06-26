import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getToolStatRows } from './tool-stat-rows'

describe('getToolStatRows', () => {
  it('returns category, ability, and weight for thieves tools', () => {
    const tools = pickEquipment('thieves-tools')
    if (tools.kind !== 'tool') throw new Error('expected tool')

    const rows = getToolStatRows(tools)
    expect(rows).toEqual([
      { label: 'Category', value: "Thieves' Tools" },
      { label: 'Ability', value: 'Dexterity' },
      {
        label: 'Utilize',
        value: 'Pick a lock (DC 15), or Disarm a trap (DC 15)',
      },
      { label: 'Weight', value: '1 lb' },
    ])
  })

  it('returns category and ability for a lute', () => {
    const lute = pickEquipment('lute')
    if (lute.kind !== 'tool') throw new Error('expected tool')

    const rows = getToolStatRows(lute)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Musical Instrument')).toBe(
      true,
    )
    expect(rows.some((row) => row.label === 'Ability' && row.value === 'Charisma')).toBe(true)
    expect(rows.some((row) => row.label === 'Weight' && row.value === '2 lb')).toBe(true)
  })
})
