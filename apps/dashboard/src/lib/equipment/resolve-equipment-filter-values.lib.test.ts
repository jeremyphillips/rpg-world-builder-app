import { describe, expect, it } from 'vitest'

import { pickArmor, pickEquipment } from '@/test/fixtures/pick'

import { resolveEquipmentFilterValues } from './resolve-equipment-filter-values.lib'

describe('resolveEquipmentFilterValues', () => {
  it('maps weapon category and mode', () => {
    const dagger = pickEquipment('dagger')
    expect(resolveEquipmentFilterValues(dagger)).toEqual({
      category: dagger.category,
      mode: dagger.mode,
    })
  })

  it('maps thrown melee weapon mode from catalog fixtures', () => {
    const handaxe = pickEquipment('handaxe')
    expect(resolveEquipmentFilterValues(handaxe)?.mode).toBe('melee')
  })

  it('maps armor stealth metadata slugs', () => {
    const leather = pickArmor('leather-armor')
    expect(resolveEquipmentFilterValues(leather)?.stealth).toBe('none')

    const ringMail = pickArmor('ring-mail')
    expect(resolveEquipmentFilterValues(ringMail)?.stealth).toBe('disadvantage')
  })

  it('maps tool category', () => {
    const tool = pickEquipment('thieves-tools')
    expect(resolveEquipmentFilterValues(tool)).toEqual({ category: tool.toolCategory })
  })
})
