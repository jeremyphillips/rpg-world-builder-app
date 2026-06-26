import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getAdventuringGearStatRows } from './adventuring-gear-stat-rows'

describe('getAdventuringGearStatRows', () => {
  it('returns gear kind, weight, and properties for a torch', () => {
    const torch = pickEquipment('torch')
    if (torch.kind !== 'adventuring_gear') throw new Error('expected adventuring gear')

    const rows = getAdventuringGearStatRows(torch)
    expect(rows).toEqual([
      { label: 'Gear kind', value: 'General' },
      { label: 'Weight', value: '1 lb' },
    ])
  })

  it('returns ammunition fields for arrows', () => {
    const arrows = pickEquipment('arrows')
    if (arrows.kind !== 'adventuring_gear') throw new Error('expected adventuring gear')

    const rows = getAdventuringGearStatRows(arrows)
    expect(rows.some((row) => row.label === 'Gear kind' && row.value === 'Ammunition')).toBe(true)
    expect(rows.some((row) => row.label === 'Bundle size' && row.value === '20')).toBe(true)
    expect(rows.some((row) => row.label === 'Storage' && row.value === 'Quiver')).toBe(true)
  })

  it('returns holy symbol usage for an amulet', () => {
    const amulet = pickEquipment('holy-symbol-amulet')
    if (amulet.kind !== 'adventuring_gear') throw new Error('expected adventuring gear')

    const rows = getAdventuringGearStatRows(amulet)
    expect(rows.some((row) => row.label === 'Holy symbol usage' && row.value === 'Worn, Held')).toBe(
      true,
    )
  })
})
