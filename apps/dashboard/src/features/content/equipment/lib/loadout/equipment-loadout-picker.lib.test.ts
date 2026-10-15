import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { buildLoadoutEquipmentPickerItems } from './equipment-loadout-picker.lib'

describe('buildLoadoutEquipmentPickerItems', () => {
  it('defaults isProficient to true when resolveIsProficient is omitted', () => {
    const greataxe = pickEquipment('greataxe')
    const items = buildLoadoutEquipmentPickerItems([greataxe])
    expect(items[0]?.state.isProficient).toBe(true)
  })

  it('maps resolveIsProficient onto each row', () => {
    const greataxe = pickEquipment('greataxe')
    const dagger = pickEquipment('dagger')
    const items = buildLoadoutEquipmentPickerItems([greataxe, dagger], {
      resolveIsProficient: (equipment) => equipment.slug === 'dagger',
    })
    expect(items.find((row) => row.equipment.slug === 'greataxe')?.state.isProficient).toBe(false)
    expect(items.find((row) => row.equipment.slug === 'dagger')?.state.isProficient).toBe(true)
  })
})
