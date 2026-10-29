import { describe, expect, it } from 'vitest'
import type { ArmorClassRules, ArmorEquipment, Equipment } from '@rpg/contracts'

import { pickEquipment } from '@/test/fixtures/pick'

import { armorColumns } from './armor-overview-columns'

function asArmor(item: Equipment): ArmorEquipment {
  if (item.kind !== 'armor') throw new Error(`expected armor, received ${item.kind}`)
  return item
}

function displayedAcSort(item: ArmorEquipment, rules: ArmorClassRules): number {
  const column = armorColumns('campaign', undefined, rules).find((entry) => entry.id === 'ac')
  if (!column || !('accessorFn' in column) || typeof column.accessorFn !== 'function') {
    throw new Error('missing AC sort')
  }
  const value = column.accessorFn(item, 0)
  if (typeof value !== 'number') throw new Error('expected numeric AC sort')
  return value
}

describe('armor overview AC sort', () => {
  const plate = asArmor(pickEquipment('plate-armor'))
  const leather = asArmor(pickEquipment('leather-armor'))

  it('sorts by displayed AC in both directions', () => {
    const ascending = { mode: 'ascending', base: 10 } satisfies ArmorClassRules
    const descending = { mode: 'descending', base: 10 } satisfies ArmorClassRules

    expect(displayedAcSort(plate, ascending)).toBeGreaterThan(displayedAcSort(leather, ascending))
    expect(displayedAcSort(plate, descending)).toBeLessThan(displayedAcSort(leather, descending))
    expect(plate.baseAcOffset).toBeGreaterThan(leather.baseAcOffset ?? 0)
  })
})
