import { describe, expect, it } from 'vitest'

import { MATCHES_WEAPON_PROFICIENCY_LABEL } from '@rpg/contracts'

import { pickEquipment } from '@/test/fixtures/pick'

import {
  applyLoadoutWeaponMatchSignals,
  buildLoadoutEquipmentPickerItems,
} from './equipment-loadout-picker.lib'

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

describe('applyLoadoutWeaponMatchSignals', () => {
  it('stamps an exact unowned match and leaves an owned copy unmarked', () => {
    const dagger = pickEquipment('dagger')
    const greataxe = pickEquipment('greataxe')
    const items = applyLoadoutWeaponMatchSignals({
      items: buildLoadoutEquipmentPickerItems([dagger, greataxe]),
      targets: [{ weaponId: dagger.id }, { weaponId: greataxe.id }],
      inventory: [{ equipmentId: greataxe.id, quantity: 2, equipped: false }],
    })
    const daggerRow = items.find((row) => row.equipment.id === dagger.id)
    const axeRow = items.find((row) => row.equipment.id === greataxe.id)
    expect(daggerRow?.state.resolved?.presentation?.facts.map((fact) => fact.label)).toContain(
      MATCHES_WEAPON_PROFICIENCY_LABEL,
    )
    expect(axeRow?.state.resolved).toBeUndefined()
    expect(daggerRow?.state.isRecommended).toBe(false)
  })
})
