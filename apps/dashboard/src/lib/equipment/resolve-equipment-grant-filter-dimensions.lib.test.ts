import { describe, expect, it } from 'vitest'

import { pickArmor, pickEquipment } from '@/test/fixtures/pick'

import {
  resolveEquipmentComboboxFilterValues,
  resolveEquipmentGrantFilterDimensions,
} from './resolve-equipment-grant-filter-dimensions.lib'

function expectWeapon(slug: Parameters<typeof pickEquipment>[0]) {
  const equipment = pickEquipment(slug)
  if (equipment.kind !== 'weapon') {
    throw new Error(`Expected weapon fixture: ${slug}`)
  }
  return equipment
}

function expectTool(slug: Parameters<typeof pickEquipment>[0]) {
  const equipment = pickEquipment(slug)
  if (equipment.kind !== 'tool') {
    throw new Error(`Expected tool fixture: ${slug}`)
  }
  return equipment
}

describe('resolveEquipmentGrantFilterDimensions', () => {
  it('returns weapon category and mode', () => {
    const dagger = expectWeapon('dagger')
    expect(resolveEquipmentGrantFilterDimensions(dagger)).toEqual({
      category: dagger.category,
      mode: dagger.mode,
    })
  })

  it('returns armor category and stealth slug', () => {
    const leather = pickArmor('leather-armor')
    expect(resolveEquipmentGrantFilterDimensions(leather)?.stealth).toBe('none')

    const ringMail = pickArmor('ring-mail')
    expect(resolveEquipmentGrantFilterDimensions(ringMail)?.stealth).toBe('disadvantage')
  })

  it('returns tool category', () => {
    const tool = expectTool('thieves-tools')
    expect(resolveEquipmentGrantFilterDimensions(tool)).toEqual({ category: tool.toolCategory })
  })
})

describe('resolveEquipmentComboboxFilterValues', () => {
  it('matches grant dimensions', () => {
    const handaxe = expectWeapon('handaxe')
    expect(resolveEquipmentComboboxFilterValues(handaxe)).toEqual(
      resolveEquipmentGrantFilterDimensions(handaxe),
    )
  })
})
